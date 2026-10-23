import { Button, type ButtonProps } from "./Button";

export function OutlineButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="outline" />;
}
