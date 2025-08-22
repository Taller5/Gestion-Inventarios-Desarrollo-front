import { useRouter } from "@tanstack/react-router";

interface ButtonProps {
    text?: string;
    style: string;
    to?: string;
    onClick?: () => void;
    icon?: string;
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
        <button className={props.style} onClick={handleClick}>
            {props.icon && (
                <img src={props.icon} alt="" className="w-13 h-20 m-auto" />
            )}
            {props.text}
        </button>
    );
}