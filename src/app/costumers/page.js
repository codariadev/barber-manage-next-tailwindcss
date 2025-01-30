'use client'
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { fetchClients, addClient, updateClient, deleteClient } from '@functions/firestoreFunction';
import Layout from '@resources/layout';

Modal.setAppElement('#root');

export default function Costumers() {
    const [clients, setClients] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState({ id: null, name: '', cpf: '', email: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [sortBy, setSortBy] = useState('name');

    useEffect(() => {
        const loadClients = async () => {
            try {
                const fetchedClients = await fetchClients();
                setClients(sortClients(fetchedClients, sortBy));
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
            }
        };
        loadClients();
    }, [sortBy]);

    const sortClients = (clients, criteria) => {
        return criteria === 'name' 
            ? clients.sort((a, b) => a.name.localeCompare(b.name)) 
            : clients.sort((a, b) => b.createdAt - a.createdAt);
    };

    const handleOpenModal = (client = { id: null, name: '', cpf: '', email: '', phone: '' }) => {
        setCurrentClient(client);
        setErrors({});
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setModalIsOpen(false);
        setCurrentClient({ id: null, name: '', cpf: '', email: '', phone: '' });
        setErrors({});
    };

    const handleSaveClient = async (e) => {
        e.preventDefault();
        if (!currentClient.name.trim() || !currentClient.email.trim() || !currentClient.phone.trim()) {
            setErrors({
                name: !currentClient.name.trim() ? 'O nome é obrigatório.' : '',
                email: !currentClient.email.trim() ? 'O email é obrigatório.' : '',
                phone: !currentClient.phone.trim() ? 'O telefone é obrigatório.' : ''
            });
            return;
        }
        try {
            const clientData = { ...currentClient, createdAt: new Date().getTime() };
            currentClient.id ? await updateClient(currentClient.id, clientData) : await addClient(clientData);
            handleCloseModal();
            setClients(await fetchClients());
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
        }
    };
    
    const handleDeleteClient = async (clientId) => {
        if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
            return;
        }

        try {
            await deleteClient(clientId);
            setClients(await fetchClients());
        } catch (error) {
            console.error('Erro ao excluir o cliente', error);
        }
    };


    return (
        <Layout>
            <div className="p-5 flex flex-col  items-center w-full h-full rounded" id="root">
                <div className="text-center mb-6 bg-gray-100 p-8 rounded-lg shadow-lg w-full">
                    <h1 className="text-2xl font-bold">Clientes</h1>
                    <p className="text-gray-600">Gerencie seus clientes cadastrados</p>
                </div>
                <div className="flex mt-1 space-x-1 justify-evenly w-full">
                    <div className='flex gap-5'>
                        <button className={`px-2 py-2 rounded-md text-xs ${sortBy === 'name' ? 'bg-gray-800 text-white' : 'bg-gray-300'}`} onClick={() => setSortBy('name')}>Ordenar por Nome</button>
                        <button className={`px-4 py-2 rounded-md text-xs ${sortBy === 'date' ? 'bg-gray-800 text-white' : 'bg-gray-300'}`} onClick={() => setSortBy('date')}>Ordenar por Data</button>
                    </div>
                    <button className="bg-blue-500 text-white px-2 text-xs py-2 rounded-md hover:bg-blue-600" onClick={() => handleOpenModal()}>Adicionar Cliente</button>
                </div>
                {modalIsOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                        <form className="bg-white p-6 rounded-lg shadow-lg w-96" onSubmit={handleSaveClient}>
                            <h2 className="text-lg font-bold mb-4">{currentClient.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                            <label className="block mb-2">Nome:<input type="text" className="w-full border p-2 rounded" value={currentClient.name} onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })} required /></label>
                            <label className="block mb-2">CPF:<input type="number" className="w-full border p-2 rounded" value={currentClient.cpf} onChange={(e) => setCurrentClient({ ...currentClient, cpf: e.target.value })} required /></label>
                            <label className="block mb-2">Email:<input type="email" className="w-full border p-2 rounded" value={currentClient.email} onChange={(e) => setCurrentClient({ ...currentClient, email: e.target.value })} required /></label>
                            <label className="block mb-4">Telefone:<input type="text" className="w-full border p-2 rounded" value={currentClient.phone} onChange={(e) => setCurrentClient({ ...currentClient, phone: e.target.value })} required /></label>
                            <div className="flex justify-end space-x-2">
                                <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" onClick={handleCloseModal}>Cancelar</button>
                                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">{currentClient.id ? 'Salvar Alterações' : 'Adicionar'}</button>
                            </div>
                        </form>
                    </div>
                )}
                <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow w-full">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="p-3">Nome</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Telefone</th>
                                <th className="p-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.id} className="border-t">
                                    <td className="p-3">{client.name}</td>
                                    <td className="p-3">{client.email}</td>
                                    <td className="p-3">{client.phone}</td>
                                    <td className="p-3 flex space-x-2">
                                        <button className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600" onClick={() => handleOpenModal(client)}>Editar</button>
                                        <button className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600" onClick={() => handleDeleteClient(client.id)}>Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
