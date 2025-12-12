import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { AlertCircle, Edit, Loader2, Mail, Printer } from "lucide-react";
import Button from "../../components/ui/Button";
import CreateInvoice from "./CreateInvoice";
import ReminderModal from "./ReminderModal";
import toast from "react-hot-toast";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const invoiceRef = useRef();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.INVOICE.GET_INVOICE_BY_ID(id)
        );
        setInvoice(response.data);
      } catch (error) {
        toast.error("Failed to fetch invoice");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      const response = await axiosInstance.put(
        API_PATHS.INVOICE.UPDATE_INVOICE(id),
        formData
      );
      toast.success("Invoice updated successfully");
      setIsEditing(false);
      setInvoice(response.data);
    } catch (error) {
      toast.error("Failed to update invoice.");
      console.error(error);
    }
  };

  const handlePrint = () => {
    window.print();
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg">
        <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="size-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Invoice not found
        </h3>
        <p className="text-slate-600 mb-6 max-w-md">
          The invoice you are looking for does not exist or could not be loaded.
        </p>
        <Button onClick={() => navigate("/invoices")}>
          Back to all invoices
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return <CreateInvoice existingInvoice={invoice} onSave={handleUpdate} />;
  }

  return (
    <>
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        invoiceId={id}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 print:hidden ">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4 sm:m-0">
          Invoice{" "}
          <span className="font-mono text-slate-500">
            {invoice.invoiceNumber}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          {invoice.status !== "Paid" && (
            <Button
              variant="secondary"
              onClick={() => setIsReminderModalOpen(true)}
              icon={Mail}
            >
              Generate Reminder
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => setIsEditing(true)}
            icon={Edit}
          >
            Edit
          </Button>

          <Button variant="primary" onClick={handlePrint} icon={Printer}>
            Print or Download
          </Button>
        </div>
      </div>

      <div id="invoice-content-wrapper">
        <div
          ref={invoiceRef}
          id="invoice-preview"
          className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-md border border-slate-200 "
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            {/* LEFT SIDE — INVOICE NUMBER */}
            <div>
              <h2 className="">INVOICE</h2>
              <p className="">#{invoice.invoiceNumber}</p>
            </div>

            {/* RIGHT SIDE — STATUS */}
            <div className="">
              <p className="">Status</p>

              <span
                className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
            ${
              invoice.status === "Paid"
                ? "bg-emerald-100 text-emerald-800"
                : invoice.status === "Pending"
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
            }
          `}
              >
                {invoice.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8">
            {/* BILL FROM */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Bill From
              </h3>
              <p className="font-semibold text-slate-800">
                {invoice.businessName}
              </p>
              <p className="text-slate-600">{invoice.address}</p>
              <p className="text-slate-600">{invoice.email}</p>
              <p className="text-slate-600">{invoice.phone}</p>
            </div>

            {/* BILL TO */}
            <div className="sm:text-right">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Bill To
              </h3>
              <p className="font-semibold text-slate-800">
                {invoice.billTo.clientName}
              </p>
              <p className="text-slate-600">{invoice.billTo.address}</p>
              <p className="text-slate-600">{invoice.billTo.email}</p>
              <p className="text-slate-600">{invoice.billTo.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 my-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Invoice Date
              </h3>
              <p className="font-medium text-slate-800">
                {new Date(invoice.invoiceDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Due Date
              </h3>
              <p className="font-medium text-slate-800">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Payment Terms
              </h3>
              <p className="font-medium text-slate-800">
                {invoice.paymentTerms}
              </p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ">
                    Item
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-medium text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-medium text-slate-600">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-medium text-slate-900">
                      ${Number(item.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-3">
              {/* SUBTOTAL */}
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>${Number(invoice.subtotal).toFixed(2)}</span>
              </div>

              {/* TAX TOTAL */}
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>${invoice.taxTotal.toFixed(2)}</span>
              </div>

              {/* GRAND TOTAL */}
              <div className="flex justify-between font-semibold text-lg text-slate-900">
                <span>Total</span>
                <span>${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Notes
              </h3>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @page{
            padding: 10px;   
          }
          @media print{
            body * {
              visibility: hidden;
            }
            #invoice-content-wrapper, #invoice-content-wrapper * {
              visibility: visible;
            }
            #invoice-content-wrapper{
              position:absolute;
              left:0;
              top:0;
              right:0;
              width:100%;        
            }
            #invoice-preview{
              box-shadow: none;
              border: none;
              border-radius:0;
              padding:0;
            }
          }   
        `}
      </style>
    </>
  );
};

export default InvoiceDetail;
