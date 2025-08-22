interface NavProps {
    logo?: string;
    button?: React.ReactNode;
    title?: string;
    inputs?: React.ReactNode[];
    text?: string;
}

export default function Nav(props: NavProps) {
  return (
    <nav className="bg-white flex items-center justify-between px-7 py-4 shadow">
      <div className="font-bold text-xl text-verde-oscuro">Logo</div>
      <div className="font-light">
        {props.button}
      </div>
    </nav>
  );
}