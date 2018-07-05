import React from "react";
import {
    Grid,
    GridColumn,
    GridCell,
    GridDetailRow,
    GridToolbar
} from "@progress/kendo-react-grid";
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
import { Redirect } from "react-router-dom";
import { DropDownList } from "@progress/kendo-react-dropdowns";

import FuncIsLoggedIn from "../../auth";
import Server from "../../config";
import DropDownCell from "./DropDownCell";
import AvatarCell from "./AvatarCell";
import DetailComponent from "./DetailComponent";

let data = [];

class Provider extends React.Component {
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
        this.updateOwnerState = this.updateOwnerState.bind(this);
        this.expandChange = this.expandChange.bind(this);

        // emit provider read request via socket.io, and
        // set the callback func to process the response
        Socket.emit(
            "provider:read",
            JSON.stringify({
                skip: 0,
                limit: this.defaultPageSize,
                search: {
                    ownership: 2
                },
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
                ownership: 2
            }
        };

        // bind events to state
        this.enterInsert = this.enterInsert.bind(this);
        this.itemChange = this.itemChange.bind(this);
        this.sortChange = this.sortChange.bind(this);
        this.filterChange = this.filterChange.bind(this);

        // UI related only
        this.toggle = this.toggle.bind(this);
        this.toggleFade = this.toggleFade.bind(this);

        // bind commands to state
        const enterEdit = this.enterEdit.bind(this);
        const save = this.save.bind(this);
        const cancel = this.cancel.bind(this);
        const remove = this.remove.bind(this);

        // define command cell class to handle commands
        class MyCommandCell extends GridCell {
            render() {
                return !this.props.dataItem.inEdit ? (
                    <td style={{ padding: "5px", margin: "5px" }}>
                        <button
                            style={{ width: "75px", padding: "5px" }}
                            className="k-primary k-button k-grid-edit-command btn-xs"
                            onClick={() => enterEdit(this.props.dataItem)}
                        >
                            Edit
                        </button>
                        <button
                            style={{ width: "75px", padding: "5px" }}
                            className="k-button k-grid-remove-command btn-xs"
                            onClick={() =>
                                window.confirm(
                                    "Confirm deleting: " +
                                        this.props.dataItem.name
                                ) && remove(this.props.dataItem)
                            }
                        >
                            Remove
                        </button>
                    </td>
                ) : (
                    <td style={{ padding: "5px", margin: "5px" }}>
                        <button
                            style={{ width: "75px", padding: "5px" }}
                            className="k-button k-grid-save-command btn-sm"
                            onClick={() => save(this.props.dataItem)}
                        >
                            {this.props.dataItem.id ? "Update" : "Add"}
                        </button>
                        <button
                            style={{ width: "75px", padding: "5px" }}
                            className="k-button k-grid-cancel-command btn-sm"
                            onClick={() => cancel(this.props.dataItem)}
                        >
                            {this.props.dataItem.id ? "Cancel" : "Discard"}
                        </button>
                    </td>
                );
            }
        }
        this.CommandCell = MyCommandCell;
    }

    callbackRead(stringResponse) {
        // parse the response
        const response = JSON.parse(stringResponse);

        console.log("[Provider.funcResponseCallback] response:", response);

        if (response === null) {
            return;
            // TODO: handle this issue by a timeout and
            // calling the pull request again
        } else if (response.code !== 200) {
            return;
        }

        let fields = [];
        if (response.providers.length > 0) {
            fields = Object.getOwnPropertyNames(response.providers[0]).slice(
                0,
                10
            );
        }

        // set the responseProvider variable as a clone of the handler response
        data = response.providers.slice(0);

        // checkout the pagesize
        let pageSize = this.state.pageSize;
        if (response.limit + response.skip < response.total) {
            pageSize = response.providers.length;
        }

        this.setState({
            data: response.providers.slice(0),
            total: response.total,
            skip: response.skip,
            fields: fields,
            pageSize: pageSize
            // pagerState: Object.assign({}, this.state.pagerState, {
            //   pageSize: response.providers.length
            // })
        });
    }

    callbackSave(stringResponse) {
        let response = JSON.parse(stringResponse);

        console.log("[Provider.callbackSave] objectResponse:", response);

        if (response.code !== 200) {
        }
    }

    callbackDelete(stringResponse) {
        console.log(
            "[Provider.callbackDelete] stringResponse: ",
            stringResponse
        );
    }

    enterInsert() {
        const dataItem = {
            inEdit: true,
            Discontinued: false
        };

        console.log("[Provider.enterInsert] dataItem:", dataItem);

        const newProviders = this.state.data.slice();
        newProviders.unshift(dataItem);

        this.update(newProviders, dataItem);

        this.setState({
            data: newProviders
        });
    }

    enterEdit(dataItem) {
        console.log("[Provider.enterEdit] dataItem:", dataItem);

        this.update(this.state.data, dataItem).inEdit = true;
        this.setState({
            data: this.state.data.slice()
        });
    }

    save(dataItem) {
        console.log(
            "[Provider.save] before calling update. dataItem:",
            dataItem
        );

        dataItem.inEdit = undefined;
        dataItem.id = this.update(data, dataItem).id;

        this.setState({
            data: this.state.data.slice()
        });
        console.log(
            "[Provider.save] after calling update. dataItem:",
            dataItem
        );

        Socket.emit(
            "provider:save",
            JSON.stringify(dataItem),
            this.callbackSave
        );
    }

    cancel(dataItem) {
        console.log("[Provider.cancel] dataItem:", dataItem);

        if (dataItem.id) {
            let originalItem = data.find(p => p.id === dataItem.id);
            this.update(this.state.data, originalItem);
        } else {
            this.update(this.state.data, dataItem, !dataItem.id);
        }
        this.setState({
            data: this.state.data.slice()
        });
    }

    remove(dataItem) {
        console.log("[Provider.remove] dataItem:", dataItem);

        dataItem.inEdit = undefined;

        this.update(this.state.data, dataItem, true);
        this.update(data, dataItem, true);

        this.setState({
            data: this.state.data.slice()
        });

        Socket.emit(
            "provider:delete",
            JSON.stringify({
                id: dataItem.id
            }),
            this.callbackDelete
        );
    }

    update(data, item, remove) {
        console.log("[Provider.update] item:", item, "remove:", remove);

        let updated;
        let index = data.findIndex(
            p => p === item || (item.id && p.id === item.id)
        );

        if (index >= 0) {
            updated = Object.assign({}, item);
            data[index] = updated;
        } else {
            let id = 1;
            // data.forEach(p => { id = Math.max(p.ProductID + 1, id); });
            updated = Object.assign({}, item, { id: id });
            data.unshift(updated);
            index = 0;
        }

        if (remove) {
            return data.splice(index, 1)[0];
        }

        return data[index];
    }

    itemChange(event) {
        console.log("[Provider.itemChange] event:", event);

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
            "provider:read",
            JSON.stringify({
                skip: this.state.skip,
                limit: this.state.limit,
                search: this.state.search,
                filter: this.state.filter,
                sort: event.sort3
            }),
            this.callbackRead
        );
    }

    filterChange(event) {
        console.log("[Provider.filterChange] event.filter:", event.filter);

        this.setState({
            filter: event.filter
        });

        console.log(
            "[Provider.filterChange] before emit read request, this.state.filter:",
            this.state.filter
        );

        console.log(
            "[Provider.filterChange] before emit read request, event.filter:",
            event.filter
        );

        this.setState({
            filter: event.filter
        });

        console.log(
            "[Provider.filterChange] before emit read request, this.state.filter:",
            this.state.filter
        );

        console.log(
            "[Provider.filterChange] before emit read request, event.filter:",
            event.filter
        );

        Socket.emit(
            "provider:read",
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

    onPageChange(e) {
        console.log(
            "[Provider.eventOnPageChange] e.page.skip:",
            e.page.skip,
            "e.page.limit:",
            e.page.limit
        );

        this.setState({
            skip: e.page.skip,
            limit: e.page.take
        });

        Socket.emit(
            "provider:read",
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

    updatePagerState(key, value) {
        console.log(
            "[Provider.funcUpdatePagerState] key:",
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
            "[Provider.funcUpdateOwnershipState] key:",
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
            "[Provider.funcUpdateOwnershipState] after update",
            "this.state.objectSearchState:",
            this.state.filter
        );

        Socket.emit(
            "provider:read",
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
                detail={DetailComponent}
                expandField="expanded"
                expandChange={this.expandChange}
                pageChange={this.onPageChange.bind(this)}
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
                sort={this.state.sort}
                sortChange={this.sortChange}
                sortable={{
                    allowUnsort: this.state.allowUnsort,
                    mode: this.state.multiple ? "multiple" : "single"
                }}
            >
                {gridToolbar}
                <GridColumn
                    cell={this.CommandCell}
                    width="169px"
                    sortable={false}
                    filterable={false}
                />
                <GridColumn
                    field="imageId"
                    title="Image"
                    editable={false}
                    sortable={false}
                    filterable={false}
                    width="90px"
                    cell={AvatarCell}
                />
                <GridColumn field="name" title="Name" width="230px" />
                <GridColumn
                    field="isConfirmed"
                    title="IsConfirmed"
                    editor="boolean"
                    filter="boolean"
                    width="150px"
                />
                <GridColumn
                    field="categories"
                    title="Categories"
                    editable={false}
                    sortable={false}
                    // filterable={false}
                    width="200px"
                />
                <GridColumn
                    field="description"
                    title="Description"
                    editable={false}
                    width="200px"
                />
                <GridColumn
                    field="phoneNumbers"
                    title="PhoneNumbers"
                    editable={false}
                    width="200px"
                />
                <GridColumn field="mobile" title="Mobile" width="200px" />
                <GridColumn
                    field="membersCount"
                    title="Members No"
                    editable={false}
                    width="200px"
                />
                <GridColumn
                    field="background"
                    title="Background"
                    editable={false}
                    sortable={false}
                    // filterable={false}
                    width="200px"
                />
                <GridColumn
                    field="latitude"
                    title="Latitude"
                    sortable={false}
                    editable={false}
                    filter="numeric"
                    width="160px"
                />
                <GridColumn
                    field="longitude"
                    title="Longitude"
                    sortable={false}
                    editable={false}
                    filter="numeric"
                    width="160px"
                />
                <GridColumn
                    field="id"
                    title="ID"
                    editable={false}
                    width="163px"
                />

                {/* <GridColumn field="ProductID" title="Id" width="50px" editable={false} />
          <GridColumn field="ProductName" title="Product Name" />
          <GridColumn field="FirstOrderedOn" title="First Ordered" 
            editor="date" format="{0:d}" />
          <GridColumn field="UnitsInStock" title="Units" editor="numeric" />
          <GridColumn field="Discontinued" cell={DropDownCell} /> */}
            </Grid>
        );

        return (
            <div>              
                {columnCard}
                {grid}
            </div>
        );
    }
}

export default Provider;
