import { Button, type ButtonProps } from "./Button";

export function WarningOutlineButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="warning" />;
}
