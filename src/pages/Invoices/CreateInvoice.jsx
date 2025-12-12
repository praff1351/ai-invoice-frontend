import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { useEffect, useState } from "react";

import { toast } from "react-hot-toast";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import InputField from "../../components/ui/InputField";
import TextareaField from "../../components/ui/TextareaField";
import SelectField from "../../components/ui/SelectField";
import Button from "../../components/ui/Button";
import moment from "moment";

const CreateInvoice = ({ existingInvoice, onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [formData, setFormData] = useState(
    existingInvoice || {
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      billFrom: {
        businessName: user?.businessName || "",
        email: user?.email || "",
        address: user?.address || "",
        phone: user?.phone || "",
      },
      billTo: {
        clientName: "",
        email: "",
        address: "",
        phone: "",
      },
      items: [{ name: "", quantity: 1, unitPrice: 0, taxPercent: 0 }],
      notes: "",
      paymentTerms: "Net 15",
    }
  );
  const [loading, setLoading] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(
    !existingInvoice
  );

  useEffect(() => {
    if(!existingInvoice && user){

    setFormData(prev => ({
      ...prev,
      billFrom:{
        businessName: user.businessName || '',
        email: user.email || '',
        address: user.address || '',
        phone: user.phone || ''

      }
    }))
  }




    const aiData = location.state?.aiData;

    // If AI parsed data exists, prefill the form
    if (aiData) {
      setFormData((prev) => ({
        ...prev,
        billTo: {
          clientName: aiData.clientName || "",
          email: aiData.email || "",
          address: aiData.address || "",
          phone: "",
        },
        items: aiData.items || [
          { name: "", quantity: 1, unitPrice: 0, taxPercent: 0 },
        ],
      }));
    }
    if (existingInvoice) {
      setFormData({
        ...existingInvoice,
        invoiceDate: moment(existingInvoice.invoiceDate).format("YYYY-MM-DD"),
        dueDate: moment(existingInvoice.dueDate).format("YYYY-MM-DD"),
      });
    } else {
      const generateNewInvoiceNumber = async () => {
        setIsGeneratingNumber(true);
        try {
          const response = await axiosInstance.get(
            API_PATHS.INVOICE.GET_ALL_INVOICES
          );
          const invoices = response.data;
          let maxNum = 0;
          invoices.forEach((inv) => {
            const num = parseInt(inv.invoiceNumber.split("-")[1]);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          });
          const newInvoiceNumber = `INV-${String(maxNum + 1).padStart(3, "0")}`;
          setFormData((prev) => ({ ...prev, invoiceNumber: newInvoiceNumber }));
        } catch (error) {
          console.error("Failed to generate invoice number", error);
          setFormData((prev) => ({
            ...prev,
            invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
          }));
        }
        setIsGeneratingNumber(false);
      };
      generateNewInvoiceNumber();
    }
  }, [existingInvoice, user, location]);

  const handleInputChange = (e, section, index) => {
    const { name, value } = e.target;
  
    // --- HANDLE ITEMS ---
    if (section === "items" && index !== undefined) {
      const updatedItems = [...formData.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value
      };
      setFormData((prev) => ({ ...prev, items: updatedItems }));
      return;
    }
  
    // --- HANDLE BILL FROM ---
    if (name === "businessName") {
      setFormData(prev => ({
        ...prev,
        billFrom: { ...prev.billFrom, businessName: value }
      }));
      return;
    }
  
    if (name === "emailFrom") {
      setFormData(prev => ({
        ...prev,
        billFrom: { ...prev.billFrom, email: value }
      }));
      return;
    }
  
    if (name === "addressFrom") {
      setFormData(prev => ({
        ...prev,
        billFrom: { ...prev.billFrom, address: value }
      }));
      return;
    }
  
    if (name === "phoneFrom") {
      setFormData(prev => ({
        ...prev,
        billFrom: { ...prev.billFrom, phone: value }
      }));
      return;
    }
  
    // --- HANDLE BILL TO ---
    if (name === "clientName") {
      setFormData(prev => ({
        ...prev,
        billTo: { ...prev.billTo, clientName: value }
      }));
      return;
    }
  
    if (name === "clientEmail") {
      setFormData(prev => ({
        ...prev,
        billTo: { ...prev.billTo, email: value }
      }));
      return;
    }
  
    if (name === "clientAddress") {
      setFormData(prev => ({
        ...prev,
        billTo: { ...prev.billTo, address: value }
      }));
      return;
    }
  
    if (name === "clientPhone") {
      setFormData(prev => ({
        ...prev,
        billTo: { ...prev.billTo, phone: value }
      }));
      return;
    }
  
    // --- ROOT FIELDS ---
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  

  const handleAddition = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { name: "", quantity: 1, unitPrice: 0, taxPercent: 0 },
      ],
    });
  };
  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const { subtotal, taxTotal, total } = (() => {
    let subtotal = 0,
      taxTotal = 0;
    formData.items.forEach((item) => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      subtotal += itemTotal;
      taxTotal += itemTotal * ((item.taxPercent || 0) / 100);
    });
    return { subtotal, taxTotal, total: subtotal + taxTotal };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const itemsWithTotal = formData.items.map((item)=>({
      ...item,
      total:(item.quantity || 0) *(item.unitPrice || 0) + (1+ (item.taxPercent || 0)/100)
    }
    ));
    const finalFormData = {...formData, items: itemsWithTotal, subtotal, taxTotal, total};
    if(onSave){
      await onSave(finalFormData);
    }else{
      try{
        const response = await axiosInstance.post(API_PATHS.INVOICE.CREATE, finalFormData);
        toast.success("Invoice created successfully");
        navigate(`/invoices/${response.data._id}`);

      }catch(err){
        toast.error("Failed to create invoice.");
        console.log(err);
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-[100vh]">
      {/* HEADER + BUTTON */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">
          {existingInvoice ? "Edit Invoice" : "Create Invoice"}
        </h2>

        <Button type="submit" isLoading={loading || isGeneratingNumber}>
          {existingInvoice ? "Save Changes" : "Save Invoice"}
        </Button>
      </div>

      {/* FORM CONTAINER */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 shadow-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* INVOICE NUMBER */}
          <InputField
            label="Invoice Number"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            readOnly
            placeholder={isGeneratingNumber ? "Generating..." : ""}
            disabled
          />

          {/* INVOICE DATE */}
          <InputField
            label="Invoice Date"
            type="date"
            name="invoiceDate"
            value={formData.invoiceDate}
            onChange={handleInputChange}
          />

          {/* DUE DATE */}
          <InputField
            label="Due Date"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* BILL FROM & BILL TO SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BILL FROM SECTION */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 shadow-gray-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Bill From
          </h3>

          <InputField
            label="Business Name"
            name="businessName"
            value={formData.billFrom.businessName}
            onChange={handleInputChange}
          />

          <InputField
            label="Email"
            type="email"
            name="emailFrom"
            value={formData.billFrom.email}
            onChange={handleInputChange}
          />

          <TextareaField
            label="Address"
            name="addressFrom"
            value={formData.billFrom.address}
            onChange={handleInputChange}
          />

          <InputField
            label="Phone"
            name="phoneFrom"
            value={formData.billFrom.phone}
            onChange={handleInputChange}
          />
        </div>

        {/* BILL TO SECTION */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 shadow-gray-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Bill To</h3>

          <InputField
            label="Client Name"
            name="clientName"
            value={formData.billTo.clientName}
            onChange={handleInputChange}
          />

          <InputField
            label="Client Email"
            type="email"
            name="clientEmail"
            value={formData.billTo.email}
            onChange={handleInputChange}
          />

          <TextareaField
            label="Client Address"
            name="clientAddress"
            value={formData.billTo.address}
            onChange={handleInputChange}
          />

          <InputField
            label="Client Phone"
            name="clientPhone"
            value={formData.billTo.phone}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* ITEMS SECTION */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm shadow-gray-100 overflow-x-auto p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Items</h3>

        <table className="w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Item
              </th>
              <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Qty
              </th>
              <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Price
              </th>
              <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Tax (%)
              </th>
              <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Total
              </th>
              <th className="px-2 sm:px-6 py-3"></th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-200">
            {formData.items.map((item, index) => (
              <tr key={index} className="">
                {/* ITEM NAME */}
                <td className="px-2 sm:px-6 py-3">
                  <input
                    type="text"
                    name="name"
                    value={item.name}
                    onChange={(e) => handleInputChange(e, "items", index)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm"
                  />
                </td>

                {/* QUANTITY */}
                <td className="px-2 sm:px-6 py-3">
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    min="1"
                    onChange={(e) => handleInputChange(e, "items", index)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm"
                  />
                </td>

                {/* PRICE */}
                <td className="px-2 sm:px-6 py-3">
                  <input
                    type="number"
                    name="unitPrice"
                    value={item.unitPrice}
                    min="0"
                    onChange={(e) => handleInputChange(e, "items", index)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm"
                  />
                </td>

                {/* TAX */}
                <td className="px-2 sm:px-6 py-3">
                  <input
                    type="number"
                    name="taxPercent"
                    value={item.taxPercent}
                    min="0"
                    onChange={(e) => handleInputChange(e, "items", index)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm"
                  />
                </td>

                {/* TOTAL */}
                <td className="px-2 sm:px-6 py-3 text-sm font-medium text-slate-800">
                  ₹{((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                </td>

                {/* REMOVE BUTTON */}
                <td className="px-2 sm:px-6 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ADD ITEM BUTTON */}
        <div className="mt-4">
          <Button type="button" variant="ghost" onClick={handleAddition}>
            + Add Item
          </Button>
        </div>
      </div>

      {/* NOTES & PAYMENT TERMS + TOTALS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* NOTES + PAYMENT TERMS SECTION */}
        <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Notes & Terms
          </h3>

          <TextareaField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
          />

          <SelectField
            label="Payment Terms"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleInputChange}
            options={["Net 15", "Net 30", "Net 60", "Due on receipt"]}
          />
        </div>

        {/* TOTAL SUMMARY SECTION */}
        <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200">
          <div className="space-y-4">
            {/* SUBTOTAL */}
            <div className="flex justify-between text-sm text-slate-600">
              <p>Subtotal:</p>
              <p>₹{subtotal.toFixed(2)}</p>
            </div>

            {/* TAX */}
            <div className="flex justify-between text-sm text-slate-600">
              <p>Tax:</p>
              <p>₹{taxTotal.toFixed(2)}</p>
            </div>

            {/* GRAND TOTAL */}
            <div className="flex justify-between text-lg font-semibold text-slate-900 border-t pt-4">
              <p>Total:</p>
              <p>₹{total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateInvoice;
