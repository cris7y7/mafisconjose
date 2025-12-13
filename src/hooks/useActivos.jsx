import { useEffect } from "react";

function useActivos() {
const [datos, setDatos] = useState([]);


useEffect(()=> {
    fetch("http://127.0.0.1:5000/activoss")
      .then((res) => res.json())
      .then((data) => setDatos(data));
}, []);
}

export default useActivos
