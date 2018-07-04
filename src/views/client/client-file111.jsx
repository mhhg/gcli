import React from "react";
import ReactDOM from "react-dom";
import {
    Grid,
    GridColumn as Column,
    GridToolbar,
    GridCell
} from "@progress/kendo-react-grid";
import Server from "../../config";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import Dialog from "./dialog.jsx";
// import { sampleProducts } from './sample-products.jsx';
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

class AvatarCell extends GridCell {
    constructor(props) {
        super(props);

        let imageSrc = Server.Addr + "/api/file/avatar/";

        if (props.dataItem.imageId !== "") {
            imageSrc = imageSrc + props.dataItem.imageId;
        } else {
            imageSrc = "assets/img/avatars/7.png";
        }

        console.log(
            "[AvatarCell] imageSrc:",
            imageSrc,
            "props.imageId:",
            props.dataItem.imageId,
            "ServerAddr:",
            Server.Addr
        );

        this.state = {
            imageSrc: imageSrc
        };
    }

    handleChange(e) {
        this.props.onChange({
            dataItem: this.props.dataItem,
            field: this.props.field,
            syntheticEvent: e.syntheticEvent,
            value: e.target.value
        });
    }

    render() {
        return (
            <td
                style={{
                    padding: "2px"
                }}
            >
                <img
                    style={{
                        height: "71px",
                        width: "71px"
                    }}
                    src={this.state.imageSrc}
                />
            </td>
        );
    }
}

let data = [];
class client extends React.Component {
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
        this.callbackDelete = this.callbackDelete.bind(this);

        // emit provider read request via socket.io, and
        // set the callback func to process the response
        Socket.emit(
            "user:read",
            JSON.stringify({
                skip: 0,
                limit: this.defaultPageSize,
                search: {},
                filter: initialFilter,
                sort: []
            }),
            this.callbackRead
        );

        // setup state
        this.state = {
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
                ownership: 0
            },
            sort: [],
            products: [],
            productInEdit: undefined
        };

        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.remove = this.remove.bind(this);
        this.cancel = this.cancel.bind(this);
        this.insert = this.insert.bind(this);
        this.onDialogInputChange = this.onDialogInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        // bind events to state
        this.itemChange = this.itemChange.bind(this);
        this.sortChange = this.sortChange.bind(this);
        this.filterChange = this.filterChange.bind(this);

        // UI related only
        this.toggle = this.toggle.bind(this);
        this.toggleFade = this.toggleFade.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
    }
    // ------------------------------------
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
        const products = this.state.data.slice();

        const initialFilter = {
            logic: "and",
            filters: []
        };

        Socket.emit("user:save", JSON.stringify(dataItem), this.callbackSave);
    }

    cancel() {
        this.setState({ productInEdit: undefined });
    }

    insert() {
        this.setState({ productInEdit: {} });
    }
    // ------------------
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

    callbackRead(stringResponse) {
        // parse the response
        const response = JSON.parse(stringResponse);

        console.log("[User.funcResponseCallback] response.users:", response);

        if (response === null) {
            // TODO: handle this issue by a timeout and
            // calling the pull request again
            return;
        } else if (response.code !== 200) {
            return;
        }

        let fields = [];
        if (response.users.length > 0) {
            fields = Object.getOwnPropertyNames(response.users[0]).slice(0, 10);
        }

        // set the responseProvider variable as a clone of the handler response
        data = response.users.slice(0);

        this.setState({
            data: response.users.slice(0),
            total: response.total,
            skip: response.skip,
            fields: fields
            // pageSize: response.users.length,
            // pagerState: Object.assign({}, this.state.pagerState, {
            //   pageSize: response.users.length
            // })
        });
    }

    callbackSave(stringResponse) {
        let response = JSON.parse(stringResponse);

        console.log("[User.callbackSave] objectResponse:", response);

        if (response.code !== 200) {
            alert(response);
        }
    }

    callbackDelete(stringResponse) {
        console.log("[User.callbackDelete] stringResponse: ", stringResponse);
    }
    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    toggleFade() {
        this.setState({ fadeIn: !this.state.fadeIn });
    }

    itemChange(event) {
        console.log("[User.itemChange] event:", event);

        const value = event.value;
        const name = event.field;
        if (!name) {
            return;
        }

        const updatedData = this.state.data.slice();
        const item = this.update(updatedData, event.dataItem);
        item[name] = value;

        this.setState({
            data: updatedData
        });
    }

    sortChange(event) {
        console.log("[User.sortChange] event.sort:", event.sort);

        this.setState({
            sort: event.sort
        });

        console.log(
            "[User.sortChange] this.state.limit:",
            this.state.limit,
            "this.state.skip:",
            this.state.skip
        );

        Socket.emit(
            "user:read",
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

    filterChange(event) {
        console.log("[User.filterChange] event.filter:", event.filter);

        this.setState({
            filter: event.filter
        });

        console.log(
            "[User.filterChange] before emit read request, this.state.filter:",
            this.state.filter
        );

        Socket.emit(
            "user:read",
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
    render() {
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
                        Enable unsorting
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
                Providers Grid State Form
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
                {/* <div className="col-md-3">{ownershipState}</div> */}
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

        const gridToolbar = (
            <GridToolbar>
                <button
                    title="Add new"
                    className="k-button k-primary"
                    onClick={this.enterInsert}
                >
                    Add new
                </button>
                {this.state.data.filter(p => p.inEdit).length > 0 && (
                    <button
                        title="Cancel current changes"
                        className="k-button"
                        onClick={() => this.setState({ data: data.slice() })}
                    >
                        Cancel current changes
                    </button>
                )}
            </GridToolbar>
        );
        const grid = (
            <Grid
                data={this.state.data}
                style={{ height: "420px" }}
                // pageChange={this.onPageChange.bind(this)}
                skip={this.state.skip}
                total={this.state.total}
                pageable={this.state.pagerState}
                pageSize={this.state.pageSize}
                itemChange={this.itemChange}
                filterable={true}
                filter={this.state.filter}
                filterChange={this.filterChange}
                style={{ maxHeight: "750px" }}
                editField="inEdit"
                sortable={{
                    allowUnsort: this.state.allowUnsort,
                    mode: this.state.multiple ? "multiple" : "single"
                }}
                sort={this.state.sort}
                sortChange={this.sortChange}
            >
                <GridToolbar>
                    <button onClick={this.insert} className="k-button">
                        Add New
                    </button>
                </GridToolbar>
                <Column
                    width="200px"
                    title="Edit"
                    cell={cellWithEditing(this.edit, this.remove)}
                />
                <Column field="id" title="ID" editable={false} width="150px" />
                <Column
                    field="imageId"
                    title="Image"
                    editable={false}
                    sortable={false}
                    filterable={false}
                    width="73px"
                    cell={AvatarCell}
                />
                <Column field="username" title="Username" width="200px" />
                <Column field="firstname" title="FirstName" width="200px" />
                <Column field="lastname" title="LastName" width="200px" />
                <Column
                    field="confirmed"
                    title="Confirmed"
                    width="200px"
                    editor="boolean"
                    filter="boolean"
                />
                <Column
                    field="isAdmin"
                    title="IsAdmin"
                    width="200px"
                    editor="boolean"
                    filter="boolean"
                />
                <Column
                    field="gender"
                    title="Gender"
                    width="200px"
                    editable={false}
                />
                <Column field="nationalId" title="NationalID" width="200px" />
                <Column field="middlename" title="Middlename" width="200px" />
                <Column
                    field="email"
                    title="Email"
                    width="200px"
                    editor={"email"}
                />
                <Column field="address" title="Address" width="200px" />
                <Column field="id" title="ID" editable={false} width="150px" />
            </Grid>
        );
        return (
            <div>
                {columnCard}
                {grid}
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
                                    Username<br />
                                    <Input
                                        type="text"
                                        name="username"
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
                                    FirstName<br />
                                    <Input
                                        type="text"
                                        name="firstname"
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
                                    lastname<br />
                                    <Input
                                        type="text"
                                        name="LastName"
                                        value={
                                            this.state.productInEdit
                                                .ProductName || ""
                                        }
                                        onChange={this.onDialogInputChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="confirmed"
                                        checked={
                                            this.state.productInEdit
                                                .Discontinued || false
                                        }
                                        onChange={this.onDialogInputChange}
                                    />
                                    Confirmed
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isAdmin"
                                        checked={
                                            this.state.productInEdit
                                                .Discontinued || false
                                        }
                                        onChange={this.onDialogInputChange}
                                    />
                                    IsAdmin
                                </label>
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label>
                                    Gender<br />
                                    <Input
                                        type="text"
                                        name="gender"
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
                                    Middlename<br />
                                    <Input
                                        type="text"
                                        name="middlename"
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
                                    Email<br />
                                    <Input
                                        type="text"
                                        name="email"
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
                                    Address<br />
                                    <Input
                                        type="text"
                                        name="address"
                                        value={
                                            this.state.productInEdit
                                                .ProductName || ""
                                        }
                                        onChange={this.onDialogInputChange}
                                    />
                                </label>
                            </div>
                            {/* <div style={{ marginBottom: '1rem' }}>
                            <label>
                                Units In Stock<br />
                                <NumericTextBox
                                    name="UnitsInStock"
                                    value={this.state.productInEdit.UnitsInStock || 0}
                                    onChange={this.onDialogInputChange}
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    name="Discontinued"
                                    checked={this.state.productInEdit.Discontinued || false}
                                    onChange={this.onDialogInputChange}
                                />
                                Discontinued product
                            </label>
                        </div> */}
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
            ProductID: this.generateId(),
            ProductName: "",
            UnitsInStock: 0,
            Discontinued: false
        };

        return Object.assign(newProduct, source);
    }
}

export default client;
