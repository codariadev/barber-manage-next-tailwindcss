"use client"
import React, { useEffect, useState } from 'react';
import { fetchAppointments, fetchClients } from '../../functions/firestoreFunction';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Layout from '../resources/layout';

const Home = () => {
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [userName] = useState("Lucas Eduardo");

  const handleNavigation = (path) => {
    router.push(path);
  };

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const appointments = await fetchAppointments();
        setEvents(appointments);

        const clientsData = await fetchClients();
        setClients(clientsData);
      } catch (error) {
        console.log('Erro ao carregar agendamentos', error);
      }
    };
    loadAppointments();
  }, []);

  return (
    <Layout>
      <div className="p-5 bg-gray-100 w-full mx-auto h-screen">
        <header className="bg-blue-500 text-white p-5 rounded-lg text-center">
          <h1 className="text-2xl font-bold">Bem-vindo (a), {userName}!</h1>
          <p>Hoje é {new Date().toLocaleDateString('pt-BR')}</p>
        </header>

        <section className="flex gap-5 mt-8">
          <div className="flex-1 bg-white p-5 rounded-lg shadow-md text-center">
            <h2 className="text-blue-500 text-xl">Agendamentos</h2>
            <p>{events.length} agendamentos!</p>
            <button onClick={() => handleNavigation('/appointments')} className="mt-3 px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
              Ver todos
            </button>
          </div>
          <div className="flex-1 bg-white p-5 rounded-lg shadow-md text-center">
            <h2 className="text-blue-500 text-xl">Clientes</h2>
            <p>Você tem {clients.length} clientes cadastrados</p>
            <button onClick={() => handleNavigation('/costumers')} className="mt-3 px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
              Gerenciar
            </button>
          </div>
        </section>

        <section className="mt-12 w-full ">
          <h2 className="text-xl text-center mb-5">Próximos Agendamentos</h2>
          <div className="bg-white rounded-lg shadow-md h-full flex justify-center">
            {events.length === 0 ? (
              <p>Sem agendamentos</p>
            ) : (
              <div className='w-full p-5'>
                {events
                  .filter((event) => new Date(event.start) >= new Date())
                  .sort((a, b) => new Date(a.start) - new Date(b.start))
                  .map((event) => (
                    <div key={event.id} className="bg-gray-200 p-2 rounded-md shadow-sm flex justify-between">
                      <p>Cliente: <strong>{event.costumer}</strong></p>
                      <p className="text-center">{format(new Date(event.start), 'dd/MM/yyyy')}</p>
                      <p className="text-right">{format(new Date(event.start), 'HH:mm')} até {format(new Date(event.end), 'HH:mm')}</p>
                    </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
