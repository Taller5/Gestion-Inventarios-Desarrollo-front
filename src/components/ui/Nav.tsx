interface NavProps {
    logo?: string;
    button?: React.ReactNode;
    title?: string;
    inputs?: React.ReactNode[];
    text?: string;
}

export default function Nav(props: NavProps) {
  return (
    <nav className="bg-white flex items-center justify-between py-1 px-7 shadow h-[80px] w-full top-0 left-0">
      <div className="font-bold text-xl text-verde-oscuro"><img className="w-20 h-10" src="/img/logo.png" alt="logo" /></div>
      <div className="font-light">
        {props.button}
      </div>
    </nav>
  );
}