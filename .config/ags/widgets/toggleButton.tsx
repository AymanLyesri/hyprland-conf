import { Binding, Variable } from "astal";
import { Widget } from "astal/gtk3";

export interface ToggleButtonProps extends Widget.ButtonProps {
  onToggled?: (self: Widget.Button, on: boolean) => void;
  state?: Binding<boolean> | boolean;
  child?: JSX.Element;
}

export default function ToggleButton(btnprops: ToggleButtonProps) {
  const { state = false, onToggled, setup, child, ...props } = btnprops;
  const innerState = Variable(state instanceof Binding ? state.get() : state);

  return (
    <button
      {...props}
      setup={(self) => {
        setup?.(self);

        self.toggleClassName("checked", innerState.get());
        self.hook(innerState, () =>
          self.toggleClassName("checked", innerState.get())
        );

        if (state instanceof Binding) {
          self.hook(state, () => innerState.set(state.get()));
        }
      }}
      onClicked={(self) => {
        onToggled?.(self, !innerState.get());
        innerState.set(!innerState.get());
        self.toggleClassName("checked", innerState.get());
      }}>
      {child}
    </button>
  );
}
