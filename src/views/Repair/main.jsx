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
import { 
    Badge,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Row,
    Collapse,
    Fade 
} from "reactstrap";

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
        this.expandChange = this.expandChange.bind(this);

        // UI related only
        this.toggle = this.toggle.bind(this);
        this.toggleFade = this.toggleFade.bind(this);
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
    updatePagerState(key, value) {
        console.log(
            "[Repair.funcUpdatePagerState] key:",
            key,
            "value:",
            value
        );

        const newPagerState = Object.assign({}, this.state.pagerState, {
            [key]: value
        });

        this.setState(
            Object.assign({}, this.state, {
                pagerState: newPagerState
            })
        );
    }
    updateOwnerState(key, value) {
        console.log(
            "[Repair.funcUpdateOwnershipState] key:",
            key,
            "value:",
            value
        );

        this.setState({
            search: Object.assign(this.state.search, {
                ownership: parseInt(value, 10)
            })
        });

        console.log(
            "[Repair.funcUpdateOwnershipState] after update",
            "this.state.objectSearchState:",
            this.state.filter
        );

        Socket.emit(
            "repair:read",
            JSON.stringify({
                skip: 0,
                limit: this.defaultPageSize,
                search: this.state.search,
                filter: this.state.filter,
                sort: this.state.sort
            }),
            this.callbackRead
        );
    }
    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    toggleFade() {
        this.setState({ fadeIn: !this.state.fadeIn });
    }

    expandChange(event) {
        console.log("[expandChange] event:", event);

        event.dataItem.expanded = !event.dataItem.expanded;
        this.forceUpdate();
    }
    
    render() {
        const ownershipState = (
            <dl>
                <dt>Ownership status filter:</dt>
                <dd>
                    <input
                        type="radio"
                        name="ownership"
                        id="ownershipTemplate"
                        className="k-radio"
                        value="1"
                        onChange={e => {
                            this.updateOwnerState("type", e.target.value);
                        }}
                    />
                    <label
                        style={{
                            margin: "7px 3em 7px 0px",
                            lineHeight: "1.2"
                        }}
                        className="k-radio-label"
                        htmlFor="ownershipTemplate"
                    >
                        Template (Excel)&nbsp;
                    </label> 
                    <input
                        defaultChecked={true}
                        type="radio"
                        name="ownership"
                        id="ownershipRegistered"
                        className="k-radio"
                        value="2"
                        onChange={e => {
                            this.updateOwnerState("type", e.target.value);
                        }}
                    />
                    <label
                        style={{
                            margin: "7px 3em 7px 0px",
                            lineHeight: "1.2"
                        }}
                        className="k-radio-label"
                        htmlFor="ownershipRegistered"
                    >
                        Registered&nbsp;
                    </label>
                    <input
                        type="radio"
                        name="ownership"
                        id="ownershipAll"
                        className="k-radio"
                        value="0"
                        onChange={e => {
                            this.updateOwnerState("type", e.target.value);
                        }}
                    />
                    <label
                        style={{
                            margin: "7px 3em 7px 0px",
                            lineHeight: "1.2"
                        }}
                        className="k-radio-label"
                        htmlFor="ownershipAll"
                    >
                        All&nbsp;
                    </label>
                </dd>
            </dl>

        );
        const filterState = (
            <dl>
                <dt>Filter state:</dt>
                <dd>
                    <input
                        type="checkbox"
                        className="k-checkbox"
                        id="unsort"
                        checked={this.state.allowUnsort}
                        onChange={e =>
                            this.setState({
                                allowUnsort: e.target.checked
                            })
                        }
                    />
                    <label
                        htmlFor="unsort"
                        className="k-checkbox-label"
                        style={{
                            lineHeight: "1.2",
                            marginBottom: "1em"
                        }}
                    >
                        Enable UnSorting
                    </label>
                    <br />
                    <input
                        type="checkbox"
                        className="k-checkbox"
                        id="multiSort"
                        checked={this.state.multiple}
                        onChange={e =>
                            this.setState({
                                multiple: e.target.checked
                            })
                        }
                    />
                    <label
                        htmlFor="multiSort"
                        className="k-checkbox-label"
                        style={{ lineHeight: "1.2" }}
                    >
                        Enable multiple columns sorting
                    </label>
                </dd>
            </dl>
        );

        const pagerTypeState = (
            <dl>
                <dt>Pager type:</dt>
                <dd>
                    <input
                        type="radio"
                        name="pager"
                        id="numeric"
                        className="k-radio"
                        value="numeric"
                        defaultChecked={true}
                        onChange={e => {
                            this.updatePagerState("type", e.target.value);
                        }}
                    />
                    <label
                        style={{
                            margin: "7px 3em 7px 0px",
                            lineHeight: "1.2"
                        }}
                        className="k-radio-label"
                        htmlFor="numeric"
                    >
                        Numeric&nbsp;
                    </label>
                    <input
                        type="radio"
                        name="pager"
                        id="input"
                        className="k-radio"
                        value="input"
                        onChange={e => {
                            this.updatePagerState("type", e.target.value);
                        }}
                    />
                    <label
                        style={{
                            margin: "7px 3em 7px 0px",
                            lineHeight: "1.2"
                        }}
                        className="k-radio-label"
                        htmlFor="input"
                    >
                        Input&nbsp;
                    </label>
                </dd>
            </dl>
        );

        const infoState = (
            <dl>
                <dd>
                    <div className="col-md-12">
                        <input
                            className="k-checkbox"
                            defaultChecked={true}
                            id="showInfo"
                            type="checkbox"
                            onChange={e => {
                                this.updatePagerState("info", e.target.checked);
                            }}
                        />
                        <label htmlFor="showInfo" className="k-checkbox-label">
                            Show info
                        </label>
                    </div>
                    <div className="col-md-12">
                        <input
                            className="k-checkbox"
                            defaultChecked={true}
                            id="pageSize"
                            type="checkbox"
                            onChange={e => {
                                this.updatePagerState(
                                    "pageSizes",
                                    e.target.checked
                                );
                            }}
                        />
                        <label htmlFor="pageSize" className="k-checkbox-label">
                            Show page sizes
                        </label>
                    </div>
                    <div className="col-md-12">
                        <input
                            className="k-checkbox"
                            defaultChecked={true}
                            type="checkbox"
                            id="previousNext"
                            onChange={e => {
                                this.updatePagerState(
                                    "previousNext",
                                    e.target.checked
                                );
                            }}
                        />
                        <label
                            htmlFor="previousNext"
                            className="k-checkbox-label"
                        >
                            Show previous / next buttons
                        </label>
                    </div>
                </dd>
            </dl>
        );

        const buttonsState = (
            <dl>
                <dt>Max. number of buttons:</dt>
                <dd>
                    <input
                        defaultValue="5"
                        className="k-textbox"
                        type="number"
                        onChange={e => {
                            this.updatePagerState(
                                "buttonCount",
                                e.target.valueAsNumber
                            );
                        }}
                    />
                </dd>
            </dl>
        );

        const cardHeader = (
            <CardHeader>
                Repair Grid State Form
                <div className="card-header-actions">
                    <a
                        className="card-header-action btn btn-minimize"
                        data-target="#collapseExample"
                        onClick={this.toggle}
                    >
                        <i className="icon-arrow-up" />
                    </a>
                </div>
            </CardHeader>
        );

        const cardBody = (
            <div className="col-md-12 row">
                <div className="col-md-3">{ownershipState}</div>
                <div className="col-md-2">{filterState}</div>
                <div className="col-md-2">{pagerTypeState}</div>
                <div className="col-md-2">{infoState}</div>
                <div className="col-md-3">{buttonsState}</div>
            </div>
        );

        const card = (
            <Card
                className="card-accent-primary"
                style={{ padding: "0px", marginBottom: "5px" }}
            >
                {cardHeader}
                <Collapse isOpen={this.state.collapse} id="collapseExample">
                    <CardBody>
                        <div className="example-config row">{cardBody}</div>
                    </CardBody>
                </Collapse>
            </Card>
        );

        const columnCard = (
            <Col md="12" style={{ padding: "0px", marginBottom: "5px" }}>
                <Fade timeout={this.state.timeout} in={this.state.fadeIn}>
                    {card}
                </Fade>
            </Col>
        );
        return (

            <div>
                {columnCard}
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
