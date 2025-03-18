import { Binding, Variable } from "astal";
import { Widget } from "astal/gtk3";

// Define the props interface for the ToggleButton component
export interface ToggleButtonProps extends Widget.ButtonProps {
  // Callback function triggered when the button is toggled
  onToggled?: (self: Widget.Button, on: boolean) => void;

  // The state of the button can be a boolean or a reactive Binding<boolean>
  state?: Binding<boolean> | boolean;

  // The child component inside the button
  child?: JSX.Element;
}

// ToggleButton functional component
export default function ToggleButton(btnprops: ToggleButtonProps) {
  // Destructure properties from props, providing default values if needed
  const { state = false, onToggled, setup, child, ...props } = btnprops;

  // Create an internal state variable
  // If `state` is a Binding, initialize with its current value; otherwise, use the boolean value directly
  const innerState = Variable(state instanceof Binding ? state.get() : state);

  return (
    <button
      {...props} // Spread other button props
      setup={(self) => {
        setup?.(self); // Call the setup function if provided

        // Apply "checked" class based on the current inner state value
        self.toggleClassName("checked", innerState.get());
        self.hook(innerState, () => {
          self.toggleClassName("checked", innerState.get());
        });

        // If `state` is a Binding, sync the inner state whenever `state` updates
        if (state instanceof Binding) {
          self.hook(state, () => innerState.set(state.get()));
        }
      }}
      onClicked={(self) => {
        // Toggle the state and trigger the `onToggled` callback with the new value
        innerState.set(!innerState.get());
        onToggled?.(self, innerState.get());
      }}
      child={child} // Set the button's child element
    />
  );
}
