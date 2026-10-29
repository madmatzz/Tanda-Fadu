import { addMinutes } from "./time";
import { estimateTotal } from "./pricing";
import { fullRange } from "./files";
import { initialState, defaultSpecs } from "./seed";
import type {
  DemoFile,
  DemoState,
  Local,
  Order,
  OrderStatus,
  PaymentMethod,
  PrintSpecs,
  QueueCrowd,
  Review,
  Role,
  SavedCard,
  StockLevel,
  ValidationState,
} from "./types";

export const STORAGE_KEY = "tanda-demo-v3";

export type DemoAction =
  | { type: "SET_ROLE"; role: Role }
  | { type: "SET_FLOW"; flow: "print" | "tanda" }
  | { type: "SET_FILE"; file: DemoFile | null }
  | { type: "SET_VALIDATION"; state: ValidationState; progress?: number; convertedFrom?: string }
  | { type: "SET_SPECS"; patch: Partial<PrintSpecs> }
  | { type: "SELECT_LOCAL"; localId: string | null }
  | { type: "SELECT_TANDA"; tandaId: string | null }
  | { type: "SET_PAYMENT"; payment: PaymentMethod | null }
  | { type: "SAVE_CARD"; card: SavedCard }
  | { type: "CONFIRM_ORDER"; id: string }
  | { type: "REPORT_QUEUE"; localId: string; crowd: QueueCrowd; inQueue: boolean }
  | { type: "SHOP_ADVANCE_ORDER"; orderId: string }
  | { type: "SHOP_CONFIRM_TANDA"; tandaId: string }
  | { type: "SHOP_SET_STOCK"; localId: string; paperId: string; level: StockLevel }
  | { type: "MARK_ALERTS_READ" }
  | { type: "ADD_REVIEW"; review: Review }
  | { type: "SHOP_REPLY_REVIEW"; reviewId: string; reply: string }
  | { type: "TOGGLE_SAVED_LOCAL"; localId: string }
  | { type: "UPDATE_LOCAL"; localId: string; patch: Partial<Pick<Local, "name" | "hours" | "phone">> }
  | { type: "RESET_DEMO" };

const nextStatus: Record<OrderStatus, OrderStatus> = {
  confirmado: "en-cola",
  "en-cola": "imprimiendo",
  imprimiendo: "listo",
  listo: "entregado",
  entregado: "entregado",
};

const crowdData: Record<QueueCrowd, { inPerson: number; waitInPerson: number }> = {
  low: { inPerson: 1, waitInPerson: 3 },
  medium: { inPerson: 3, waitInPerson: 7 },
  high: { inPerson: 6, waitInPerson: 12 },
};

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.role };

    case "SET_FLOW":
      return {
        ...state,
        draft: {
          ...state.draft,
          flow: action.flow,
          tandaId: action.flow === "print" ? null : state.draft.tandaId,
        },
      };

    case "SET_FILE":
      return {
        ...state,
        draft: {
          ...state.draft,
          file: action.file,
          specs: action.file
            ? { ...state.draft.specs, pages: action.file.pages, range: fullRange(action.file.pages) }
            : state.draft.specs,
        },
      };

    case "SET_VALIDATION":
      if (!state.draft.file) return state;
      return {
        ...state,
        draft: {
          ...state.draft,
          file: {
            ...state.draft.file,
            state: action.state,
            progress: action.progress ?? state.draft.file.progress,
            convertedFrom: action.convertedFrom ?? state.draft.file.convertedFrom,
          },
        },
      };

    case "SET_SPECS":
      return {
        ...state,
        draft: {
          ...state.draft,
          specs: { ...state.draft.specs, ...action.patch },
        },
      };

    case "SELECT_LOCAL":
      return { ...state, draft: { ...state.draft, localId: action.localId } };

    case "SELECT_TANDA":
      return {
        ...state,
        draft: {
          ...state.draft,
          tandaId: action.tandaId,
          localId: action.tandaId
            ? state.tandas.find((tanda) => tanda.id === action.tandaId)?.localId ?? state.draft.localId
            : state.draft.localId,
        },
      };

    case "SET_PAYMENT":
      return { ...state, draft: { ...state.draft, payment: action.payment } };

    case "SAVE_CARD":
      return { ...state, savedCard: action.card };

    case "CONFIRM_ORDER": {
      if (!state.draft.file) return state;
      const local = state.locals.find((item) => item.id === state.draft.localId) ?? state.locals[0];
      const specs = state.draft.specs;
      const ticket = state.nextTicket;
      const order: Order = {
        id: action.id,
        code: `FADU-${String(212 + ticket).padStart(4, "0")}`,
        ticket,
        localId: local.id,
        owner: "Lucía Pérez",
        file: state.draft.file,
        specs,
        total: estimateTotal(specs, local),
        status: "en-cola",
        createdAt: state.demoClock,
        readyAt: addMinutes(state.demoClock, local.queue.waitVirtual),
        payment: state.draft.payment ?? "efectivo",
        filesCount: 1,
        tandaId: state.draft.tandaId ?? undefined,
      };
      return {
        ...state,
        nextTicket: ticket + 1,
        orders: [order, ...state.orders],
        tandas: state.draft.tandaId
          ? state.tandas.map((tanda) =>
              tanda.id === state.draft.tandaId
                ? { ...tanda, participants: Math.min(tanda.capacity, tanda.participants + 1) }
                : tanda,
            )
          : state.tandas,
        draft: {
          ...state.draft,
          flow: "print",
          file: null,
          specs: { ...defaultSpecs },
          localId: null,
          tandaId: null,
          payment: null,
        },
      };
    }

    case "REPORT_QUEUE": {
      const crowd = crowdData[action.crowd];
      return {
        ...state,
        lastQueueReport: { ...state.lastQueueReport, [action.localId]: state.demoClock },
        locals: state.locals.map((local) => {
          if (local.id !== action.localId) return local;
          return {
            ...local,
            queue: {
              ...local.queue,
              virtual: Math.max(0, local.queue.virtual + (action.crowd === "high" ? 2 : action.crowd === "low" ? -1 : 0)),
              inPerson: action.inQueue ? crowd.inPerson : Math.max(0, crowd.inPerson - 1),
              waitInPerson: action.inQueue ? crowd.waitInPerson : Math.max(0, crowd.waitInPerson - 2),
              updatedAt: state.demoClock,
            },
          };
        }),
      };
    }

    case "SHOP_ADVANCE_ORDER":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId ? { ...order, status: nextStatus[order.status] } : order,
        ),
      };

    case "SHOP_CONFIRM_TANDA":
      return {
        ...state,
        tandas: state.tandas.map((tanda) =>
          tanda.id === action.tandaId ? { ...tanda, participants: tanda.capacity } : tanda,
        ),
        orders: state.orders.map((order) =>
          order.tandaId === action.tandaId && order.status !== "entregado"
            ? { ...order, status: "listo" }
            : order,
        ),
      };

    case "SHOP_SET_STOCK":
      return {
        ...state,
        locals: state.locals.map((local) =>
          local.id === action.localId
            ? { ...local, stock: { ...local.stock, [action.paperId]: action.level } }
            : local,
        ),
      };

    case "MARK_ALERTS_READ":
      return { ...state, alerts: state.alerts.map((alert) => ({ ...alert, read: true })) };

    case "ADD_REVIEW": {
      const { review } = action;
      return {
        ...state,
        reviews: [review, ...state.reviews],
        locals: state.locals.map((local) => {
          if (local.id !== review.localId) return local;
          const reviewCount = local.reviewCount + 1;
          const rating = (local.rating * local.reviewCount + review.rating) / reviewCount;
          return { ...local, reviewCount, rating: Math.round(rating * 10) / 10 };
        }),
      };
    }

    case "SHOP_REPLY_REVIEW":
      return {
        ...state,
        reviews: state.reviews.map((review) =>
          review.id === action.reviewId
            ? { ...review, reply: action.reply, replyAt: state.demoClock }
            : review,
        ),
      };

    case "TOGGLE_SAVED_LOCAL":
      return {
        ...state,
        savedLocalIds: state.savedLocalIds.includes(action.localId)
          ? state.savedLocalIds.filter((id) => id !== action.localId)
          : [...state.savedLocalIds, action.localId],
      };

    case "UPDATE_LOCAL":
      return {
        ...state,
        locals: state.locals.map((local) =>
          local.id === action.localId ? { ...local, ...action.patch } : local,
        ),
      };

    case "RESET_DEMO":
      return structuredClone(initialState);

    default:
      return state;
  }
}

export function loadDemoState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(initialState);
    const parsed = JSON.parse(raw) as DemoState;
    if (parsed.version !== initialState.version) return structuredClone(initialState);
    return parsed;
  } catch {
    return structuredClone(initialState);
  }
}

export function saveDemoState(state: DemoState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // La demo funciona igual sin persistencia.
  }
}
