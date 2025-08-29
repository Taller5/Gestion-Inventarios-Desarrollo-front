import { useRouter } from "@tanstack/react-router";

interface ButtonProps {
    text?: string;
    style: string;
    to?: string;
    onClick?: () => void;
    icon?: string;
    disabled?: boolean;
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
            className={`${props.style} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={handleClick}
            disabled={props.disabled}
        >
            {props.icon && (
                <img src={props.icon} alt="" className="w-13 h-20 m-auto" />
            )}
            {props.text}
        </button>
    );
}