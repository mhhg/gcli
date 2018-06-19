import React from "react";
import ReactDOM from "react-dom";
import {
    Grid,
    GridColumn as Column,
    GridToolbar
} from "@progress/kendo-react-grid";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import Dialog from "./dialog.jsx";
import cellWithEditing from "./cellWithEditing.jsx";
import Socket from "../../socket";

class Repair extends React.Component {
    constructor(props) {
        super(props);
        // set some constants
        this.defaultPageSize = 25;
        this.defaultButtonCount = 5;
        // set initial filter state
        const initialFilter = {
            logic: "and",
            filters: []
        };
        // bind state to callback events which will be
        // triggered when the server response fetched
        this.callbackRead = this.callbackRead.bind(this);
        // emit repair read request via socket.io, and
        // set the callback func to process the response
        Socket.emit(
            "repair:read",
            JSON.stringify({
                skip: 0,
                limit: this.defaultPageSize,
                filter: initialFilter,
                sort: []
            }),
            this.callbackRead
        );

        this.state = {
            // data: sampleProducts.slice(0, 7),
            // productInEdit: undefined
            collapse: false,
            fadeIn: true,
            timeout: 300,
            skip: 0,
            data: [],
            limit: this.defaultPageSize,
            sort: [],
            allowUnsort: true,
            multiple: false,
            pagerState: {
                info: true,
                type: "numeric",
                pageSizes: [5, 10, 25, 50, 75, 100],
                previousNext: true,
                pageSize: this.defaultPageSize,
                buttonCount: this.defaultButtonCount
            },
            filter: initialFilter,
            search: {
                ownership: 2
            }
        };

        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.remove = this.remove.bind(this);
        this.cancel = this.cancel.bind(this);
        this.insert = this.insert.bind(this);
        this.onDialogInputChange = this.onDialogInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.filterChange = this.filterChange.bind(this);
        this.sortChange = this.sortChange.bind(this);
    }
    callbackRead(stringResponse) {
        // parse the response
        const response = JSON.parse(stringResponse);
        console.log("[Repair.funcResponseCallback] response:", response);

        if (response === null) {
            return;
            // TODO: handle this issue by a timeout and
            // calling the pull request again
        } else if (response.code !== 200) {
            return;
        }

        let fields = [];
        if (response.data.length > 0) {
            fields = Object.getOwnPropertyNames(response.data[0]).slice(0, 10);
        }

        // checkout the pagesize
        let pageSize = this.state.pageSize;
        if (response.limit + response.skip < response.total) {
            pageSize = response.data.length;
        }
        this.setState({
            data: response.data.slice(0),
            total: response.total,
            skip: response.skip,
            fields: fields,
            pageSize: pageSize
            // pagerState: Object.assign({}, this.state.pagerState, {
            //   pageSize: response.data.length
            // })
        });
    }

    sortChange(event) {
        console.log("[Provider.sortChange] event.sort:", event.sort);

        this.setState({
            sort: event.sort
        });

        console.log(
            "[Provider.sortChange] this.state.limit:",
            this.state.limit,
            "this.state.skip:",
            this.state.skip
        );

        Socket.emit(
            "repair:read",
            JSON.stringify({
                skip: this.state.skip,
                limit: this.state.limit,
                search: this.state.search,
                filter: this.state.filter,
                sort: event.sort
            }),
            this.callbackRead
        );
    }
    onPageChange(e) {
        console.log(
            "[Repair.eventOnPageChange] e.page.skip:",
            e.page.skip,
            "e.page.limit:",
            e.page.limit
        );

        this.setState({
            skip: e.page.skip,
            limit: e.page.take
        });

        Socket.emit(
            "repair:read",
            JSON.stringify({
                skip: e.page.skip,
                limit: e.page.take,
                search: this.state.search,
                filter: this.state.filter,
                sort: this.state.sort
            }),
            this.callbackRead
        );
    }
    filterChange(event) {
        console.log("[Repair.filterChange] event.filter:", event.filter);

        this.setState({
            filter: event.filter
        });

        console.log(
            "[Repair.filterChange] before emit read request, this.state.filter:",
            this.state.filter
        );

        console.log(
            "[Repair.filterChange] before emit read request, event.filter:",
            event.filter
        );

        this.setState({
            filter: event.filter
        });

        console.log(
            "[Repair.filterChange] before emit read request, this.state.filter:",
            this.state.filter
        );

        console.log(
            "[Repair.filterChange] before emit read request, event.filter:",
            event.filter
        );

        Socket.emit(
            "repair:read",
            JSON.stringify({
                skip: this.state.skip,
                limit: this.state.limit,
                search: this.state.search,
                filter: event.filter,
                sort: this.state.sort
            }),
            this.callbackRead
        );
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    edit(dataItem) {
        this.setState({ productInEdit: this.cloneProduct(dataItem) });
    }

    remove(dataItem) {
        const products = this.state.products.slice();
        const index = products.findIndex(
            p => p.ProductID === dataItem.ProductID
        );
        if (index !== -1) {
            products.splice(index, 1);
            this.setState({
                products: products
            });
        }
    }

    save() {
        const dataItem = this.state.productInEdit;
        const products = this.state.products.slice();

        if (dataItem.ProductID === undefined) {
            products.unshift(this.newProduct(dataItem));
        } else {
            const index = products.findIndex(
                p => p.ProductID === dataItem.ProductID
            );
            products.splice(index, 1, dataItem);
        }

        this.setState({
            products: products,
            productInEdit: undefined
        });
    }

    cancel() {
        this.setState({ productInEdit: undefined });
    }

    insert() {
        this.setState({ productInEdit: {} });
    }

    onDialogInputChange(event) {
        const target = event.target;
        const value =
            target.type === "checkbox" ? target.checked : target.value;
        const name = target.props ? target.props.name : target.name;

        const edited = this.cloneProduct(this.state.productInEdit);
        edited[name] = value;

        this.setState({
            productInEdit: edited
        });
    }

    render() {
        return (
            <div>
                <Grid
                    data={this.state.data}
                    style={{ maxHeight: "750px" }}
                    skip={this.state.skip}
                    total={this.state.total}
                    pageable={this.state.pagerState}
                    pageSize={this.state.pageSize}
                    filterable={true}
                    filter={this.state.filter}
                    filterChange={this.filterChange}
                    sort={this.state.sort}
                    sortChange={this.sortChange}
                    sortable={{
                        allowUnsort: this.state.allowUnsort,
                        mode: this.state.multiple ? "multiple" : "single"
                    }}
                    pageChange={this.onPageChange.bind(this)}
                >
                    {/* <GridToolbar>
                        <button onClick={this.insert} className="k-button">
                            Add New
                        </button>
                    </GridToolbar> */}
                    <Column field="requestId" title="ID" width="50px" />
                    <Column
                        field="providerId"
                        title="ProviderID"
                        width="200px"
                    />
                    <Column field="firstname" title="Firstname"  width="110px"/>
                    <Column field="lastname" title="Lastname"  width="200px"/>
                    <Column field="description" title="Description"  width="200px"/>
                    <Column field="model" title="Model"  width="200px"/>
                    <Column field="lpn" title="LPN"  width="200px"/>
                    <Column field="date" title="Date" />
                    <Column field="time" title="Time" />
                    <Column field="mobile" title="Mobile" />
                    <Column field="voucher" title="Voucher"  width="200px"/>
                    <Column field="service" title="Service"  width="200px"/>
                    <Column field="latitude" title="Latitude"  width="200px"/>
                    <Column field="longitude" title="Longitude"  width="200px"/>

                    {/* <Column
                        title="Edit"
                        cell={cellWithEditing(this.edit, this.remove)}
                    /> */}
                </Grid>
                {this.state.productInEdit && (
                    <Dialog
                        title={this.dialogTitle()}
                        close={this.cancel}
                        ok={this.save}
                        cancel={this.cancel}
                    >
                        <form onSubmit={this.handleSubmit}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label>
                                    Product Name<br />
                                    <Input
                                        type="text"
                                        name="ProductName"
                                        value={
                                            this.state.productInEdit
                                                .ProductName || ""
                                        }
                                        onChange={this.onDialogInputChange}
                                    />
                                </label>
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label>
                                    Units In Stock<br />
                                    <NumericTextBox
                                        name="UnitsInStock"
                                        value={
                                            this.state.productInEdit
                                                .UnitsInStock || 0
                                        }
                                        onChange={this.onDialogInputChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="Discontinued"
                                        checked={
                                            this.state.productInEdit
                                                .Discontinued || false
                                        }
                                        onChange={this.onDialogInputChange}
                                    />
                                    Discontinued product
                                </label>
                            </div>
                        </form>
                    </Dialog>
                )}
            </div>
        );
    }

    dialogTitle() {
        return `${
            this.state.productInEdit.ProductID === undefined ? "Add" : "Edit"
        } product`;
    }
    cloneProduct(product) {
        return Object.assign({}, product);
    }

    newProduct(source) {
        const newProduct = {
            ProductID: "",
            firstname: "",
            Lastname: "",
            description: "",
            model: "",
            lpn: "",
            date: "",
            time: "",
            mobile: "",
            voucher: "",
            service: "",
            latitude: 0.0,
            longitude: 0.0
        };

        return Object.assign(newProduct, source);
    }

    // generateId() {
    //     let id = 1;
    //     this.state.products.forEach(p => { id = Math.max((p.ProductID || 0) + 1, id); });
    //     return id;
    // }
}

export default Repair;
