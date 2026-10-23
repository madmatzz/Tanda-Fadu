import { useNavigate } from "react-router";
import { useDemo } from "../demo/DemoProvider";
import type { Role } from "../demo/types";
import { SegmentedControl } from "../components/SegmentedControl";

const roleOptions = [
  { value: "student", label: "Vista estudiante" },
  { value: "shop", label: "Vista imprenta" },
];

export function RoleSwitch() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemo();

  const changeRole = (value: string) => {
    const role = value as Role;
    if (role === state.role) return;
    dispatch({ type: "SET_ROLE", role });
    navigate(role === "shop" ? "/imprenta" : "/");
  };

  return (
    <div className="hidden sm:block">
      <SegmentedControl
        label="Cambiar vista"
        options={roleOptions}
        value={state.role}
        onChange={changeRole}
      />
    </div>
  );
}
