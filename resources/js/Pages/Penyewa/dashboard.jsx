import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import PenyewaHeader from "@/Layouts/Penyewa/PenyewaHeader";
import DataTable from "react-data-table-component";
import CustomPaginationComponent from "@/Components/DatatableComponent/CustomPagination";
import Modal from "@/Components/Modal";
import NumberInput from "@/Components/NumberInput";
import StatusPembayaran from "@/Components/DatatableComponent/StatusPembayaran";
import CustomLoading from "@/Components/DatatableComponent/CustomLoading";
import { useMidtrans } from "@/Components/useMidtrans";

export default function PenyewaDashboard({ auth,DetailKamar, Kamar,MIDTRANS_CLIENT_KEY}) {
    const [TransactionData, setTransactionData] = useState([]);
    const [showBayarModal, setShowBayarModal] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [TablePending,setTablePending] = useState(true);


    const [paymentData,setPaymentData] = useState({
        TotalBayar: 0,
        idDetailKamar:DetailKamar.id
    })

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleChangeRowsPerPage = (newRowsPerPage) => {
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(1);
    };

    const handleChangePage = (newPage) => {
        console.log(currentPage);
        setCurrentPage(newPage);
    };

    const filteredData = TransactionData.filter((item) => {
        return (
            item.TotalBayar.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    // Mengambil data yang diperlukan berdasarkan jumlah baris per halaman dan halaman saat ini
    const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Fetching transaction data
    useEffect(() => {
        getTransactions();
    },[])

    useMidtrans(MIDTRANS_CLIENT_KEY);
      
    const getSnapToken = async () => {
        const token = document.head.querySelector('meta[name="csrf-token"]').content;
        const requestConfig = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token
            },
            body: JSON.stringify({
                TotalBayar: paymentData.TotalBayar,
                idDetailKamar: paymentData.idDetailKamar
            })
        }

        console.log('Requesting snap token');
        console.log(paymentData);
        const response = await fetch('/penyewa/bayar', requestConfig);
        console.log(response);
        const responseJSON = await response.json();
        console.log(responseJSON);
        if (response.ok) {
            window.snap.pay(responseJSON.snapToken,{
                onSuccess: function(result){
                    /* You may add your own implementation here */
                    alert("Pembayaran berhasil!"); console.log(result);
                },
                onPending: function(result){
                    /* You may add your own implementation here */
                    alert("Menunggu pembayaran!"); console.log(result);
                },
                onError: function(result){
                    /* You may add your own implementation here */
                    alert("Pembayaran gagal!"); console.log(result);
                },
                onClose: function(){
                    /* You may add your own implementation here */
                    alert('Kamu belum bayar loh!, silahkan klik kolom riwayat transaksi yang berstatus belum bayar untuk membayar tagihanmu!');
                }
            });
        }
        else{
            alert(responseJSON.error);
        }
    }

    const getTransactions = async () => {
        const token = document.head.querySelector('meta[name="csrf-token"]').content;
        const requestConfig = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token
          },
          body: JSON.stringify({
            id: auth.user.id
          })
        }
        const response = await fetch('/penyewa/transactions', requestConfig);
        const responseJSON = await response.json();
        console.log(responseJSON);
        setTransactionData((e) => {return responseJSON});
        setTablePending(false);
        console.log(TransactionData)
      }

    
      const handleBayarClick = () => {
        getSnapToken();
      }
      
      
    const getNumber = (_str) => {
        const arr = _str.split('');
        const out = arr.filter(c => !isNaN(c)).join('');
        return Number(out);
    };


    return (
        <div className="overflow-y-auto h-full">
            <PenyewaHeader auth={auth}/>

            <div className="pt-[6rem] pb-[2rem] bg-white overflow-y-auto">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                            <p className="text-sm text-gray-600">Selamat datang {' ' + auth.user.nama}</p>
                        </div>
                    </div>
                    
                    {/* Jumlah tagihan */}
                    <div className="bg-white rounded shadow p-4 mt-4 mb-4">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Detail Tagihan</h2>
                        {DetailKamar && (
                            <div>
                                <div key={DetailKamar.id} className="flex items-center justify-between mb-4">
                                    <div className="border-s-2 ps-4 border-gray-200">
                                        <div className="text-lg font-medium text-gray-600">
                                            Nomor kamar
                                        </div>
                                        <div className="text-center text-gray-600 mt-4">
                                            {DetailKamar.idKamar}
                                        </div>
                                    </div>
                                    <div className=" border-gray-200">
                                        <div className="text-lg font-medium text-gray-600">
                                            Tanggal sewa
                                        </div>
                                        <div className="text-center text-gray-600 mt-4">
                                            {DetailKamar.TanggalSewa}
                                        </div>
                                    </div>
                                    <div className=" border-gray-200">
                                        <div className="text-lg font-medium text-gray-600">
                                            Total
                                        </div>
                                        <div className="text-center text-gray-600 mt-4">
                                            Rp. {new Intl.NumberFormat('id-ID').format(auth.user.tunggakan)}
                                        </div>
                                    </div>
                                    <div className="border-r-2 pr-4 border-gray-200">
                                        <div className="text-lg font-medium text-gray-600">
                                            Tanggal jatuh tempo
                                        </div>
                                        <div className="text-center text-gray-600 mt-4">
                                            {DetailKamar.TanggalJatuhTempo}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <button onClick={() => setShowBayarModal(true)} className="rounded before:ease relative h-12 w-full overflow-hidden border border-green-500 bg-green-500 text-white transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:before:-translate-x-40">Bayar</button>
                    </div>
                    
                    <Modal show={showBayarModal} onClose={() => setShowBayarModal(false)} className={'overflow-auto'} title="Bayar Tagihan">
                        <div className="bg-white rounded-lg shadow-lg p-4 overflow-auto max-h-[95vh]">
                            <div className="space-y-4">
                                {/* Jumlah tagihan */}
                                <div className=" text-center">
                                    <label className="block text-gray-700 font-bold mb-2">Jumlah Tagihan</label>
                                    <div className="mt-[20%] mb-[20%] text-4xl">
                                        Rp. {new Intl.NumberFormat('id-ID').format(auth.user.tunggakan)}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-bold mb-2">Jumlah yang ingin dibayar</label>
                                    <div className="flex items-center gap-5">
                                        <NumberInput id="InputTotalBayar" className="w-full px-4 py-2 border border-gray-300 rounded-md" onChange={(e)=>{
                                            const num = getNumber(e.target.value);
                                            if (num === 0) {
                                                setPaymentData({
                                                    ...paymentData,
                                                    TotalBayar: '',
                                                })
                                            } else {
                                                setPaymentData({
                                                    ...paymentData,
                                                    TotalBayar: num,
                                                })
                                            }
                                        }}/>
                                        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={
                                            () => {
                                                var num = auth.user.tunggakan;
                                                document.getElementById("InputTotalBayar").value = num.toLocaleString();
                                                setPaymentData({
                                                    ...paymentData,
                                                    TotalBayar: num,
                                                });
                                            }
                                        }>Bayar full</button>

                                    </div>
                                </div>
                                {DetailKamar && (
                                    <div>
                                        <div key={DetailKamar.id} className="flex items-center justify-between mb-4">
                                            <div>
                                                <div className="text-lg font-medium text-gray-600">
                                                    Harga sewa
                                                </div>
                                                <div className="text-center text-gray-600 mt-4">
                                                    Rp. {new Intl.NumberFormat('id-ID').format(Kamar.HargaSewa)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-medium text-gray-600">
                                                    Tanggal sewa
                                                </div>
                                                <div className="text-center text-gray-600 mt-4">
                                                    {new Date(DetailKamar.TanggalSewa).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-medium text-gray-600">
                                                    Tanggal Jatuh Tempo
                                                </div>
                                                <div className="text-center text-gray-600 mt-4">
                                                    {new Date(DetailKamar.TanggalJatuhTempo).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {/* <p>{`Nomor Kamar: ${DetailKamar.idKamar}`}</p>
                                            <p>{`Harga Sewa: Rp. ${new Intl.NumberFormat('id-ID').format(Kamar.HargaSewa)}`}</p>
                                            <p>{`Tanggal Sewa: ${new Date(DetailKamar.TanggalSewa).toLocaleDateString()}`}</p>
                                            <p>{`Tanggal Jatuh Tempo: ${new Date(DetailKamar.TanggalJatuhTempo).toLocaleDateString()}`}</p> */}
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}

                                <div className={"flex gap-5"}>
                                    <button onClick={(e)=>{
                                        e.preventDefault();

                                        handleBayarClick();
                                    }} type="submit" className="bg-blue-500 text-white px-4 py-2 w-full rounded-md">Bayar</button>
                                    <button onClick={() => {
                                        setShowBayarModal(false);
                                        setPaymentData({
                                            ...paymentData,
                                            TotalBayar: '',
                                        });
                                        }} className="bg-red-500 text-white px-4 py-2 w-[30%] rounded-md">Batal</button>
                                </div>

                            </div>
                        </div>
                    </Modal>
                    

                    <div className="bg-white rounded shadow p-4 mt-4">
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="mb-4 p-2 border border-gray-300 rounded"
                        />
                        <DataTable
                            columns={[
                                {
                                    name: 'Id Transaksi',
                                    selector: (row) => row.id,
                                    sortable: true,
                                },
                                {
                                    name: 'Tanggal Bayar',
                                    selector: (row) => new Date(row.TanggalBayar).toLocaleDateString(),
                                    sortable: true,
                                },
                                {
                                    name: 'Total Bayar',
                                    selector: (row) => new Intl.NumberFormat('id-ID').format(row.TotalBayar),
                                    sortable: true,
                                },
                                {
                                    name: 'Status Pembayaran',
                                    cell: (row) => (
                                        <StatusPembayaran status={row.StatusPembayaran} />
                                        
                                    ),
                                    sortable:true,
                                },
                            ]}
                            data={paginatedData}
                            pagination
                            highlightOnHover
                            striped
                            progressPending={TablePending}
                            progressComponent={
                                <CustomLoading/>
                            }
                            pointerOnHover
                            onRowClicked={(row) => window.snap.pay(row.snapToken,
                                {
                                    onSuccess: function(result){
                                        /* You may add your own implementation here */
                                        alert("Pembayaran berhasil!"); console.log(result);
                                    },
                                    onPending: function(result){
                                        /* You may add your own implementation here */
                                        alert("Menunggu pembayaran!"); console.log(result);
                                    },
                                    onError: function(result){
                                        /* You may add your own implementation here */
                                        alert("Pembayaran gagal!"); console.log(result);
                                    },
                                    onClose: function(){
                                        /* You may add your own implementation here */
                                        alert('Kamu belum bayar loh!, silahkan klik kolom riwayat transaksi yang berstatus belum bayar untuk membayar tagihanmu!');
                                    }
                                }
                            )}
                            paginationServer
                            paginationComponent={() => (
                                <CustomPaginationComponent
                                    rowsPerPageText="Baris per halaman:"
                                    rangeSeparatorText="Dari"
                                    selectAllRowsItem={true}
                                    selectAllRowsItemText="Semua"
                                    rowsPerPageOptions={[5,10, 20, 30, 40]}
                                    onChangeRowsPerPage={handleChangeRowsPerPage}
                                    currentRowsPerPage={rowsPerPage}
                                    rowCount={TransactionData.length}
                                    currentPage={currentPage}
                                    onChangePage={handleChangePage}
                                />
                            )}
                            noDataComponent="Tidak ada transaksi!"
                        />
                    </div>

                </div>
            </div>
        </div>
    )

}