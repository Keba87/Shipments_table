import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import axios from "axios";

export default function ShipmentTable() {
  // Define initial state and variables
  let emptyShipment = {
    orderNo: "",
    date: "",
    customer: "",
    trackingNo: "",
    status: "",
    consignee: "",
  };

  const statuses = ["Shipped", "In Transit", "Delivered"];

  const [shipments, setShipments] = useState(null); // State for shipments data
  const [shipmentDialog, setShipmentDialog] = useState(false); // Controls the visibility of the shipment dialog
  const [shipmentDetailsDialog, setShipmentDetailsDialog] = useState(false); // Controls the visibility of the shipment details dialog
  const [deleteShipmentDialog, setDeleteShipmentDialog] = useState(false); // Controls the visibility of the delete shipment dialog
  const [shipment, setShipment] = useState(emptyShipment); // Holds the current shipment being edited or viewed
  const [submitted, setSubmitted] = useState(false); // Tracks if the form has been submitted
  const [globalFilter, setGlobalFilter] = useState(null); // Holds the value of the global filter for the table
  const toast = useRef(null); // Reference to the Toast  component
  const dt = useRef(null); // Reference to the DataTable  component

  useEffect(() => {
    // Fetch shipment data when the component mounts
    fetchShipmentData();
  }, []);

  const fetchShipmentData = () => {
     // Fetch shipment data from the server using Axios
    axios
      .get("http://localhost:8000/shipment")
      .then((response) => {
        setShipments(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Functions to handle dialog visibility
  const hideDialog = () => {
    setSubmitted(false);
    setShipmentDialog(false);
  };

  const hideDetailsDialog = () => {
    setShipmentDetailsDialog(false);
  };

  const hideDeleteShipmentDialog = () => {
    setDeleteShipmentDialog(false);
  };

  // Save the edited shipment
  const saveShipment = () => {

    setSubmitted(true);

    if (
      shipment.orderNo &&
      shipment.date &&
      shipment.customer &&
      shipment.trackingNo &&
      shipment.status &&
      shipment.consignee
    ) {
      let _shipments = [...shipments];
      let _shipment = { ...shipment };

      if (shipment.orderNo) {
        const index = findIndexByOrderNo(shipment.orderNo);

        _shipments[index] = _shipment;
        toast.current.show({
          severity: "success",
          summary: "Successful",
          detail: "Shipment Updated",
          life: 3000,
        });
      } else {
        _shipments.push(_shipment);
        toast.current.show({
          severity: "success",
          summary: "Successful",
          detail: "Shipment Created",
          life: 3000,
        });
      }

      setShipments(_shipments);
      setShipmentDialog(false);
      setShipment(emptyShipment);
    }
  };

  const editShipment = (rowData) => {
    const { orderNo, date, customer, trackingNo, status, consignee } = rowData;
    const editedShipment = {
      orderNo,
      date,
      customer,
      trackingNo,
      status,
      consignee,
    };
    setShipment(editedShipment);
    setShipmentDialog(true);
  };

  const shipmentDetails = (rowData) => {
    const { orderNo, date, customer, trackingNo, status, consignee } = rowData;
    const shipmentDetails = {
      orderNo,
      date,
      customer,
      trackingNo,
      status,
      consignee,
    };
    setShipment(shipmentDetails);
    setShipmentDetailsDialog(true);
  };

  const confirmDeleteShipment = (shipment) => {
    setShipment(shipment);
    setDeleteShipmentDialog(true);
  };

  const deleteShipment = () => {
    let _shipments = shipments.filter(
      (val) => val.orderNo !== shipment.orderNo
    );

    setShipments(_shipments);
    setDeleteShipmentDialog(false);
    setShipment(emptyShipment);
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: "Shipment Deleted",
      life: 3000,
    });
  };

  const findIndexByOrderNo = (id) => {
    let index = -1;
    for (let i = 0; i < shipments.length; i++) {
      if (shipments[i].orderNo === id) {
        index = i;
        break;
      }
    }
    return index;
  };

  const onInputChange = (event, field) => {
    let value = event.target.value;
    if (field === "date") {
      const date = new Date(value);
      value = date.toLocaleDateString("en-US");
    }
    setShipment((prevShipment) => ({
      ...prevShipment,
      [field]: value,
    }));
  };

  // Render the action buttons for each shipment row
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-calendar"
          rounded
          outlined
          severity="success"
          onClick={() => shipmentDetails(rowData)}
        />
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          onClick={() => editShipment(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => confirmDeleteShipment(rowData)}
        />
      </React.Fragment>
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-end">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
        />
      </span>
    </div>
  );
  const shipmentDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" onClick={saveShipment} />
    </React.Fragment>
  );
  const shipmentDetailsDialogFooter = (
    <React.Fragment>
      <Button
        label="Close"
        icon="pi pi-times"
        outlined
        onClick={hideDetailsDialog}
      />
    </React.Fragment>
  );
  const deleteShipmentDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteShipmentDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteShipment}
      />
    </React.Fragment>
  );

  return (
    <div>
      <Toast ref={toast} />
      <div className="card">
        <DataTable
          ref={dt}
          value={shipments}
          dataKey="orderNo"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
          globalFilter={globalFilter}
          header={header}
        >
          <Column
            field="orderNo"
            header="ORDER NO"
            style={{ minWidth: "16rem" }}
          ></Column>
          <Column field="date" header="DATE" sortable></Column>
          <Column
            field="customer"
            header="CUSTOMER"
            sortable
            style={{ minWidth: "10rem" }}
          ></Column>
          <Column
            field="trackingNo"
            header="TRACKING NO"
            sortable
            style={{ minWidth: "16rem" }}
          ></Column>
          <Column
            field="status"
            header="STATUS"
            sortable
            style={{ minWidth: "10rem" }}
          ></Column>
          <Column
            field="consignee"
            header="CONSIGNEE"
            sortable
            style={{ minWidth: "12rem" }}
          ></Column>
          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "12rem" }}
          ></Column>
        </DataTable>
      </div>

            {/* Shipment Edit Dialog */}
      <Dialog
        visible={shipmentDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Edit Shipment"
        modal
        className="p-fluid"
        footer={shipmentDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="orderNo" className="font-bold">
            Order No
          </label>
          <InputText
            id="orderNo"
            value={shipment.orderNo}
            onChange={(e) => onInputChange(e, "orderNo")}
            disabled
            autoFocus
            className={classNames({
              "p-invalid": submitted && !shipment.orderNo,
            })}
          />
          {submitted && !shipment.orderNo && (
            <small className="p-error">orderNo is required.</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="date" className="font-bold">
            Date
          </label>
          <InputText
            id="date"
            value={shipment.date}
            onChange={(e) => onInputChange(e, "date")}
            mask="mm/dd/yyyy"
            required
            autoFocus
            className={classNames({ "p-invalid": submitted && !shipment.date })}
          />
          {submitted && !shipment.date && (
            <small className="p-error">Date is required.</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="customer" className="font-bold">
            Customer
          </label>
          <InputText
            id="customer"
            value={shipment.customer}
            onChange={(e) => onInputChange(e, "customer")}
            required
            autoFocus
            className={classNames({
              "p-invalid": submitted && !shipment.customer,
            })}
          />
          {submitted && !shipment.customer && (
            <small className="p-error">Customer is required.</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="trackingNo" className="font-bold">
            Tracking No
          </label>
          <InputText
            id="trackingNo"
            value={shipment.trackingNo}
            onChange={(e) => onInputChange(e, "trackingNo")}
            disabled
            autoFocus
            className={classNames({
              "p-invalid": submitted && !shipment.trackingNo,
            })}
          />
          {submitted && !shipment.trackingNo && (
            <small className="p-error">Tracking No is required.</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="trackingNo" className="font-bold">
            Status
          </label>
          <Dropdown
            id="status"
            value={shipment.status}
            onChange={(e) => onInputChange(e, "status")}
            options={statuses}
            required
            autoFocus
            className={classNames({
              "p-invalid": submitted && !shipment.status,
            })}
          />
          {submitted && !shipment.status && (
            <small className="p-error">Status No is required.</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="consignee" className="font-bold">
            Consignee
          </label>
          <InputText
            id="consignee"
            value={shipment.consignee}
            onChange={(e) => onInputChange(e, "consignee")}
            required
            autoFocus
            className={classNames({
              "p-invalid": submitted && !shipment.consignee,
            })}
          />
          {submitted && !shipment.consignee && (
            <small className="p-error">Consignee is required.</small>
          )}
        </div>
      </Dialog>

        {/* Shipment Details  Dialog */}
      <Dialog
        visible={shipmentDetailsDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Shipment details"
        modal
        className="p-fluid"
        footer={shipmentDetailsDialogFooter}
        onHide={hideDetailsDialog}
      >
        <div className="field">
          <label htmlFor="orderNo" className="font-bold">
            Order No
          </label>
          <InputText id="orderNo" value={shipment.orderNo} disabled />
        </div>
        <div className="field">
          <label htmlFor="date" className="font-bold">
            Date
          </label>
          <InputText id="date" value={shipment.date} disabled />
        </div>
        <div className="field">
          <label htmlFor="customer" className="font-bold">
            Customer
          </label>
          <InputText id="customer" value={shipment.customer} disabled />
        </div>
        <div className="field">
          <label htmlFor="trackingNo" className="font-bold">
            Tracking No
          </label>
          <InputText id="trackingNo" value={shipment.trackingNo} disabled />
        </div>
        <div className="field">
          <label htmlFor="status" className="font-bold">
            Status
          </label>
          <InputText id="status" value={shipment.status} disabled />
        </div>
        <div className="field">
          <label htmlFor="consignee" className="font-bold">
            Consignee
          </label>
          <InputText id="consignee" value={shipment.consignee} disabled />
        </div>
      </Dialog>

      <Dialog
        visible={deleteShipmentDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteShipmentDialogFooter}
        onHide={hideDeleteShipmentDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {shipment && (
            <span>
              Are you sure you want to delete <b>{shipment.orderNo}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
}
