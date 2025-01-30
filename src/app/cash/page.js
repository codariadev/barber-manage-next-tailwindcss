'use client'
import { useState, useEffect } from 'react';
import { deleteAppointment, fetchAppointments, fetchEmployees, fetchProducts, saveSales } from '@/functions/firestoreFunction';
import Layout from '@resources/layout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const Cash = () => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const [Employee, setEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    const loadClients = async () => {
      const clientList = await fetchAppointments();
      const appointmentClients = clientList.map(appointment => ({
        id: appointment.id,
        name: appointment.costumer,
        cpf: appointment.cpf,
        service: appointment.service || [],
      }));
      setClients(appointmentClients);
    };

    const loadProducts = async () => {
      const productList = await fetchProducts();
      setProducts(productList);
    };

    loadClients();
    loadProducts();
  }, []);

  const loadEmployees = async () => {
    try {
      const employees = await fetchEmployees();
      const filteredEmployee = employees.filter(employee => employee.cargo === 'Barbeiro').map(employee => employee.nome);
      setEmployee(filteredEmployee);
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const addToCart = (service) => {
    if (service && service.price !== undefined && service.name) {
      setCart(prevCart => {
        const updatedCart = [...prevCart, service];
        const updatedTotal = updatedCart.reduce((total, item) => total + item.price, 0);
        setTotal(updatedTotal);
        return updatedCart;
      });
    }
  };

  const deleteCart = (index) => {
    const updateCart = cart.filter((_, i) => i !== index);
    setCart(updateCart);

    const newTotal = updateCart.reduce((total, item) => total + item.price, 0);
    setTotal(newTotal);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
    setHighlightIndex(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredProducts.length > 0) {
      addToCart(filteredProducts[highlightIndex]);
    } else if (e.key === 'ArrowDown') {
      setHighlightIndex((prev) => (prev + 1) % filteredProducts.length);
    } else if (e.key === 'ArrowUp') {
      setHighlightIndex((prev) =>
        prev === 0 ? filteredProducts.length - 1 : prev - 1
      );
    }
  };

  const handleClientSelection = (clientId) => {
    if (clientId === "avulso") {
      setSelectedClient({
        id: 'avulso',
        name: 'Cliente Avulso',
        cpf: '',
        service: [],
      });
      setCart([]);
      setTotal(0);
    }else{

      const appointment = clients.find(client => client.id === clientId);
      setSelectedClient(appointment);
  
      if (appointment) {
        let clientServices = [];
        if (Array.isArray(appointment.service)) {
          clientServices = appointment.service.map(s => ({
            name: s.name,
            price: s.price
          }));
        } else if (appointment.service) {
          clientServices = [{
            name: appointment.service.name,
            price: appointment.service.price
          }];
        }
        const updatedTotal = clientServices.reduce((total, item) => total + item.price, 0);
        setTotal(updatedTotal);
        setCart(clientServices);
      } else {
        setCart([]);
      }
    };
    };


  const handleSale = async () => {
    useEffect(() => {
      const localDate = new Date();
      const formattedDate = format(localDate, 'dd/MM/yyyy', { locale: ptBR });
      const formmatedTime = format(localDate, 'HH:mm:ss');
      setDate(formattedDate);
      setTime(formmatedTime);
    }, []);

    if (!selectedClient) {
      alert('Por favor, selecione um cliente antes de finalizar a venda.');
      return;
    }

    const saleData = {
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientCpf: selectedClient.cpf,
      employee: selectedEmployee,
      total: total,
      items: cart,
      date: {
        data: formattedDate,
        hora: formmatedTime,
      },
    };
    console.log(saleData);

    try {
      await saveSales(saleData);
      alert('Venda finalizada com sucesso!');

      await deleteAppointment(selectedClient.id);

      const updateClients = clients.filter(client => client.id !== selectedClient.id);
      setClients(updateClients);

      setCart([]);
      setTotal(0);
      setSelectedEmployee(null);
      setSelectedClient(null);
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
    }
  };

  const formatCpfNumber = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };

  return (
    <Layout>
      <div className="p-5 flex flex-col  items-center w-full h-full rounded" id="root">
        <div className="text-center mb-6 bg-gray-100 p-6 rounded-lg shadow-lg w-full">
          <h1 className='text-2xl font-bold'>PDV - Caixa</h1>
        </div>
        <div className="text-center bg-gray-200 p-2 rounded-lg shadow-lg w-full flex items-start h-full">
          <div className="text-center bg-gray-100 rounded-lg shadow-lg w-2/3 flex flex-col gap-2 h-full">
            <h2 className='py-5 font-bold text-xl'>Carrinho</h2>
            <ul className="flex flex-col overflow-y-auto flex-grow gap-2">
              {cart.map((item, index) => (
                <div className='flex justify-between rounded-md pl-2 mx-5 bg-gray-300 items-center' key={index}>
                  <li>{item.name} - R$ {item.price.toFixed(2)}</li>
                  <button className='rounded-md text-sm bg-[#007bff] px-3 py-1 text-white' onClick={() => deleteCart(index)}>X</button>
                </div>
              ))}
            </ul>
          </div>

          <div className="bg-[#1e1e2f] p-5 mx-2 text-white flex flex-col justify-between align-center rounded-md h-full flex-grow">
            <div className='flex flex-col gap-2'>
              <label>Selecione o Cliente: </label>
              <select
                className='p-1 flex justify-center align-center w-full text-black rounded-md'
                onChange={(e) => handleClientSelection(e.target.value)}
                value={selectedClient?.id || ''}
              >
                <option value="">-- Selecione --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
                <option value="avulso">Cliente Avulso</option>
              </select>

              <div>
                {selectedClient ? (
                  <div className='flex flex-col gap-5 py-5' key={selectedClient.name}>
                    <div className='flex justify-evenly'>
                      <h2>Cliente</h2>
                      <p>{selectedClient.name}</p>
                    </div>
                    <div className='flex justify-evenly'>
                      <h2>CPF</h2>
                      <p>{formatCpfNumber(selectedClient.cpf)}</p>
                    </div>
                  </div>
                ) : (
                  <p>Nenhum cliente selecionado</p>
                )}
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor="employee-select" className="employee-label">
                Atribuir Funcionário
              </label>
              <select
                className="p-1 flex justify-center align-center w-full text-black rounded-md"
                id="employee-select"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Selecione um funcionário</option>
                {Employee.map((employee, index) => (
                  <option key={index} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 flex-col w-full">
              <h2>Busca de Produtos/Serviços</h2>
              <input
                className='className="p-1 flex justify-center align-center w-full text-black rounded-md'
                type="text"
                placeholder="   Digite o produto/serviço..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
              <div className="bg-white text-black rounded-md">
                {searchTerm &&
                  filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      style={{
                        borderRadius: '5px',
                        padding: '5px',
                        cursor: 'pointer',
                        backgroundColor: highlightIndex === index ? '#ddd' : 'transparent',
                      }}
                    >
                      {product.name} - R$ {product.price.toFixed(2)}
                    </div>
                ))}
              </div>

              <div className='flex justify-between items-center py-5'>
                <h3 className='font-bold'>Total: R$ {total.toFixed(2)}</h3>
                <button className='rounded-md text-sm bg-[#007bff] p-2' onClick={handleSale}>Finalizar Venda</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cash;
