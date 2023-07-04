
import React from 'react';
import './App.css';
import { PrimeReactProvider } from 'primereact/api';
import Table from './components/Table';
import Header from './components/Header';


function App() {
  return (
    <>
    <PrimeReactProvider>
      <Header />
      <Table />
    </PrimeReactProvider>
    </>
  );
}

export default App;
