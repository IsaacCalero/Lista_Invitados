import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Conectar con Supabase usando las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [invitados, setInvitados] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Cargar datos y escuchar cambios en tiempo real
  useEffect(() => {
    // 1. Traer la lista inicial
    const fetchInvitados = async () => {
      const { data } = await supabase.from('invitados').select('*').order('id', { ascending: true });
      if (data) setInvitados(data);
    };
    fetchInvitados();

    // 2. Suscribirse a los cambios en la base de datos (Tiempo Real)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitados' },
        (payload) => {
          // Cuando el de la puerta marca a alguien, esto actualiza tu pantalla al instante
          setInvitados((prev) => {
            const index = prev.findIndex(inv => inv.id === payload.new.id);
            if (index !== -1) {
              const nuevaLista = [...prev];
              nuevaLista[index] = payload.new;
              return nuevaLista;
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalCupos = invitados.reduce((acc, inv) => acc + inv.cupos, 0);
  const totalAsistentes = invitados.reduce((acc, inv) => acc + inv.asistieron, 0);

  // Actualizar la base de datos cuando haces clic
  const toggleAsistencia = async (inv) => {
    const nuevosAsistentes = inv.asistieron === 0 ? inv.cupos : 0;
    
    // Actualizamos localmente primero para que se sienta rápido
    setInvitados(invitados.map(i => i.id === inv.id ? { ...i, asistieron: nuevosAsistentes } : i));

    // Mandamos el cambio a Supabase
    await supabase
      .from('invitados')
      .update({ asistieron: nuevosAsistentes })
      .eq('id', inv.id);
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
              onClick={() => toggleAsistencia(inv)}
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