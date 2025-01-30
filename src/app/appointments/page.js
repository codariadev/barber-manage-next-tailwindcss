// Componente JSX
'use client'
import React, { useEffect, useLayoutEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react'; 
import dayGridPlugin from '@fullcalendar/daygrid'; 
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import Select from 'react-select';
import { format } from 'date-fns';

import { saveAppointment, fetchAppointments, fetchClients, deleteAppointment, fetchProducts } from '../../functions/firestoreFunction';
import Layout from '../resources/layout';

const Appointments = () => {
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState([]);
  const [clients, setClients] = useState([]);
  const [newEvent, setNewEvent] = useState({ start: '', end: '', costumer: '', cpf: '', service: '' });
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useLayoutEffect(() => {
    Modal.setAppElement('#root'); // Define o appElement para o elemento correto
  }, []);

  useEffect(() => {
    const loadAppointmentsAndProducts = async () => {
      try {
        const appointments = await fetchAppointments();
        const mappedAppointments = appointments.map((appointment) => ({
          ...appointment,
          title: appointment.costumer,
        }));

        setEvents(mappedAppointments);

        const clientsData = await fetchClients();
        const formattedClients = clientsData.map((client) => ({
          value: client.name,
          label: client.name,
          cpf: client.cpf
        }));
        setClients(formattedClients);

        const productsData = await fetchProducts();
        const filteredServices = productsData
          .filter((product) => product.category === 'Serviço')
          .map((product) => ({
            value: product.name,
            label: `${product.name} - R$ ${product.price.toFixed(2)}`,
            price: product.price,
          }));

        setServices(filteredServices);
      } catch (error) {
        console.log('Erro ao carregar dados', error);
      }
    };
    loadAppointmentsAndProducts();
  }, []);

  const handleOpenModal = (appointment = { start: '', end: '', costumer: '', id: '' }) => {
    setNewEvent(appointment);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setNewEvent({ start: '', end: '', costumer: '' });
  };

  const handleDeleteAppointment = async (appointment) => {
    try {
      await deleteAppointment(appointment);
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== appointment.id));
      alert('Agendamento deletado com sucesso.');
    } catch (error) {
      console.log('Erro ao deletar:', error);
    }
  };

  const handleSaveAppointment = async () => {
    if (!newEvent.start || !newEvent.end || !newEvent.costumer || !newEvent.service) {
      alert('Preencha todos os campos antes de salvar.');
      return;
    }
    try {
      const selectedService = services.find((service) => service.value === newEvent.service);
      const appointment = {
        start: newEvent.start,
        end: newEvent.end,
        costumer: newEvent.costumer,
        cpf: newEvent.cpf,
        service: newEvent.service
      };

      if (newEvent.id) {
        await saveAppointment(appointment, newEvent.id);
        setEvents((preEvents) => 
          preEvents.map((event) =>
            event.id === newEvent.id ? { ...event, ...appointment } : event
          )
        );
        alert('Agendamento atualizado com sucesso.');
      } else {
        const id = await saveAppointment(appointment);
        setEvents((preEvents) => [...preEvents, {id, ...appointment}]);
        alert('Agendamento salvo com sucesso');
      }

      if (selectedService) {
        setServiceDetails((prevDetails) => [
          ...prevDetails,
          {
            name: selectedService.value,
            price: selectedService.price,
          },
        ]);
      }
      handleCloseModal();
    } catch (error) {
      console.log('Erro ao salvar o agendamento', error);
    }
  };

  const handleDateClick = (info) => {
    alert(`Data clicada: ${info.dateStr}`);
  };

  return (
    <Layout>
      <div className="p-5 flex flex-col gap-2 items-center w-full h-full rounded" id="root">
        <div className="text-center mb-6 bg-gray-100 p-8 rounded-lg shadow-lg w-full">
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-gray-600">Gerencie seus horários e compromissos</p>
        </div>
        <button className="bg-blue-500 text-white px-2 text-xs py-2 rounded-md hover:bg-blue-600" onClick={() => handleOpenModal()}>Adicionar Agendamento</button>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleCloseModal}
          className="fixed top-1/2 left-1/2 translate-x-[-30%] translate-y-[-50%] w-1/2 bg-[#fff] rounded-8 shadow-2xl p-8 z-10 flex flex-col"
          contentLabel="Novo Agendamento"
        >
          <h2 className='text-center font-bold'>{newEvent.id ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
          <form>
            <div className="label-content flex flex-col space-y-3 mb-4">
              <label>Cliente:</label>
              <Select
                className="select-client"
                options={clients}
                onChange={(selectedOption) =>
                  setNewEvent({ ...newEvent, costumer: selectedOption ? selectedOption.value : '', cpf: selectedOption ? selectedOption.cpf : '' })
                }
                isClearable
                placeholder="Selecione ou digite um cliente..."
                value={newEvent.costumer ? { value: newEvent.costumer, label: newEvent.costumer } : null}
                noOptionsMessage={() => 'Nenhum cliente encontrado'}
              />
              <label>Início:</label>
              <input
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                className="p-2 border rounded"
              />
              <label>Fim:</label>
              <input
                type="datetime-local"
                value={newEvent.end}
                onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                className="p-2 border rounded"
              />
              <label>Serviço Primário</label>
              <Select
                className="flex-grow"
                options={services}
                onChange={(selectedOption) =>
                  setNewEvent({
                    ...newEvent,
                    service: selectedOption ? { name: selectedOption.value, price: selectedOption.price } : ''
                  })
                }
                isClearable
                placeholder="Selecione ou digite um serviço..."
                value={
                  newEvent.service
                    ? { value: newEvent.service.name, label: `${newEvent.service.name} - R$ ${newEvent.service.price.toFixed(2)}` }
                    : null
                }
                noOptionsMessage={() => 'Nenhum serviço encontrado'}
              />
            </div>
            <div className="input-content flex flex-col space-y-3">
              
            </div>
          </form>
          <div className="modal-actions flex justify-end space-x-3 mt-4">
            <button onClick={handleCloseModal} className="bg-gray-400 text-white p-2 rounded">Cancelar</button>
            <button onClick={() => handleDeleteAppointment(newEvent)} className="bg-red-500 text-white p-2 rounded">Deletar</button>
            <button onClick={handleSaveAppointment} className="bg-blue-500 text-white p-2 rounded">{newEvent.id ? 'Salvar Alterações' : 'Adicionar'}</button>
          </div>
        </Modal>

        <div className="z-0 flex justify-between gap-6 bg-gray-100 p-8 rounded-lg shadow-lg flex-grow w-full">
          <div className="fullcalendar bg-white p-4 rounded-lg shadow-md [&_*:where(.fc-toolbar-title)]:px-3">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              eventContent={(eventInfo) => (
                <div className="font-[10px]">
                  <span>{eventInfo.event.title}</span>
                </div>
              )}
              locale="pt-br"
              height="95%"
            />
          </div>

          <div className="next-appointment w-1/3 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl text-center mb-4">Próximos agendamentos</h2>
            {events.length !== 0 ? (
              <ul>
                {events
                  .filter((event) => new Date(event.start) >= new Date())
                  .sort((a, b) => new Date(a.start) - new Date(b.start))
                  .map((event) => (
                    <li key={event.id} className="appointment-item p-4 mb-2 bg-white rounded-lg shadow-sm">
                      <div>
                        <strong>{event.costumer}</strong>
                        {format(new Date(event.start), 'dd/MM/yyyy')} <br />
                        {format(new Date(event.start), 'HH:mm')} até
                        {format(new Date(event.end), ' HH:mm')}
                      </div>
                      <button onClick={() => handleOpenModal(event)} className="bg-blue-500 text-white p-2 rounded">Editar</button>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">Sem agendamentos próximos</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
