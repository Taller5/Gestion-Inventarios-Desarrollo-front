interface ButtonProps{ //recuerden que siempre se comienza con mayúscula
    text:string,   //esta clase la estoy haciendo meramente de ejemplo, no hace falta que sea usada
    style:string,
}

export default function Button(props: ButtonProps){ //recibe los props desde donde está siendo creado, con la estructura que se le dio en la interfaz
    return(  //retorna el componente
        <button className={props.style}>
            {props.text} 
        </button>

    )
}