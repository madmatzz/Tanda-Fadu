import { Button, type ButtonProps } from "./Button";

export function AccentButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="accent" />;
}
