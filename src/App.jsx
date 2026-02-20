import { useState, useEffect } from 'react';

const INVITADOS_INICIALES = [
  { id: 1, nombre: "Familia Parco Cadena", cupos: 2, asistieron: 0 },
  { id: 2, nombre: "Familia Garzón Tituaña", cupos: 2, asistieron: 0 },
  { id: 3, nombre: "Sr. Fernando y esposa", cupos: 2, asistieron: 0 },
  { id: 4, nombre: "Sra. Patricia Cadena e hijas", cupos: 3, asistieron: 0 },
  { id: 5, nombre: "Sr. Paul y Acompañante", cupos: 2, asistieron: 0 },
  { id: 6, nombre: "Sr. Alejandro Salcedo", cupos: 1, asistieron: 0 },
  { id: 7, nombre: "Sra. Bélgica Bastidas", cupos: 2, asistieron: 0 },
  { id: 8, nombre: "Sra. Alicia Cadena", cupos: 2, asistieron: 0 },
  { id: 9, nombre: "Familia Murillo Cadena", cupos: 4, asistieron: 0 },
  { id: 10, nombre: "Sr. Byron Salcedo", cupos: 3, asistieron: 0 },
  { id: 11, nombre: "Sra. Patricia Triviño", cupos: 1, asistieron: 0 },
  { id: 12, nombre: "Srta. Giannela Arroyo", cupos: 1, asistieron: 0 },
  { id: 13, nombre: "Srta. Camila Aguirre", cupos: 1, asistieron: 0 },
  { id: 14, nombre: "Srta. Joyce Narváez", cupos: 1, asistieron: 0 },
  { id: 15, nombre: "Sr. Oscar Gutiérrez", cupos: 1, asistieron: 0 },
  { id: 16, nombre: "Srta. Danna Mejia", cupos: 1, asistieron: 0 },
  { id: 17, nombre: "Sr. Cando", cupos: 1, asistieron: 0 }
];

function App() {
  // Inicializamos el estado leyendo el localStorage primero
  const [invitados, setInvitados] = useState(() => {
    const datosGuardados = localStorage.getItem('listaAsistenciaEmily');
    if (datosGuardados) {
      return JSON.parse(datosGuardados);
    }
    return INVITADOS_INICIALES;
  });
  
  const [busqueda, setBusqueda] = useState("");

  // Cada vez que 'invitados' cambia, lo guardamos en localStorage
  useEffect(() => {
    localStorage.setItem('listaAsistenciaEmily', JSON.stringify(invitados));
  }, [invitados]);

  const totalCupos = invitados.reduce((acc, inv) => acc + inv.cupos, 0);
  const totalAsistentes = invitados.reduce((acc, inv) => acc + inv.asistieron, 0);

  const toggleAsistencia = (id) => {
    setInvitados(invitados.map(inv => {
      if (inv.id === id) {
        // Marca la asistencia completa o la quita
        return { ...inv, asistieron: inv.asistieron === 0 ? inv.cupos : 0 };
      }
      return inv;
    }));
  };

  // Botón para reiniciar la lista si quieres hacer pruebas
  const limpiarDatos = () => {
    if(window.confirm("¿Seguro que quieres borrar toda la asistencia?")) {
      setInvitados(INVITADOS_INICIALES);
    }
  };

  const filtrados = invitados.filter(inv => 
    inv.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-slate-900">
      <header className="max-w-md mx-auto mb-6 text-center">
        <h1 className="text-3xl font-bold text-pink-600">Lista de Invitados</h1>
        <div className="flex justify-between mt-4 bg-white p-4 rounded-xl shadow-sm">
          <div><p className="text-sm text-gray-500">Invitados</p><p className="text-xl font-bold">{totalCupos}</p></div>
          <div><p className="text-sm text-gray-500">Presentes</p><p className="text-xl font-bold text-green-600">{totalAsistentes}</p></div>
          <div><p className="text-sm text-gray-500">Faltan</p><p className="text-xl font-bold text-red-400">{totalCupos - totalAsistentes}</p></div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        <input 
          type="text" 
          placeholder="Buscar invitado..." 
          className="w-full p-3 mb-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-400 outline-none"
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="space-y-3 mb-8">
          {filtrados.map(inv => (
            <div 
              key={inv.id} 
              onClick={() => toggleAsistencia(inv.id)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                inv.asistieron > 0 ? 'bg-green-50 border-green-500' : 'bg-white border-transparent shadow-sm'
              }`}
            >
              <div>
                <h3 className="font-semibold text-lg">{inv.nombre}</h3>
                <p className="text-sm text-gray-500">Cupos: {inv.cupos}</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${inv.asistieron > 0 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                {inv.asistieron > 0 ? '✓' : ''}
              </div>
            </div>
          ))}
        </div>
        
      </main>
    </div>
  );
}

export default App;