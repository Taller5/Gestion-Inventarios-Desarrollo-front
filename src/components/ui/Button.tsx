import { useRouter } from "@tanstack/react-router";

interface ButtonProps {
  text?:  React.ReactNode;
  style: string;
  to?: string;
  onClick?: () => void;
  icon?: string;
  disabled?: boolean;
  children?: React.ReactNode; // permite pasar contenido personalizado (como SVG)
}

export default function Button(props: ButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (props.onClick) {
      props.onClick();
    }
    if (props.to) {
      router.navigate({ to: props.to });
    }
  };

  return (
    <button
      className={`${props.style} ${props.disabled ? "opacity-50 cursor-not-allowed" : ""} flex items-center gap-2`}
      onClick={handleClick}
      disabled={props.disabled}
    >
      {props.icon && (
        <img src={props.icon} alt="" className="w-5 h-5" />
      )}
      {props.children ? props.children : props.text}
    </button>
  );
}
