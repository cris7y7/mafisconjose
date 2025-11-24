import { basedatos } from "./base_datos"

export default function App() {

 return  (

    <table className="table">
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Nombre del Activo</th>
        <th scope="col">Estado</th>
        <th scope="col">Ubicacion</th>
      </tr>
    </thead>

    <tbody>

      {basedatos.map((activo)=>(
          <tr  key={(activo.id)}>
            <td>{activo.id}</td>
            <td>{activo.nombre}</td>
            <td>{activo.estado}</td>
            <td>{activo.ubicacion}</td>
          </tr>

      ))}


      




    </tbody>
  </table>
 )




}




