import {
    Grid,
    GridCell,
    GridColumn as Column
} from "@progress/kendo-react-grid";
import React from "react";
import { Card, CardBody, CardHeader, Col, Collapse, Fade } from "reactstrap";
import Server from "../../config";
import Socket from "../../socket";
import cellWithLink from "./LinkCell";
import cellWithSMS from "./SendSMSCell";

class Repair extends React.Component {
    constructor(props) {
        super(props);
        this.defaultPageSize = 25; // set some constants
        this.defaultButtonCount = 5;
        const initialFilter = { logic: "and", filters: [] }; // set initial filter state
        // bind state to callback events which will be triggered when the server response fetched
        this.callbackRead = this.callbackRead.bind(this);
        this.callbackSave = this.callbackSave.bind(this);
        this.callbackSMS = this.callbackSMS.bind(this);
        this.smsSender = this.smsSender.bind(this);
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.remove = this.remove.bind(this);
        this.cancel = this.cancel.bind(this);
        this.insert = this.insert.bind(this);
        this.itemChange = this.itemChange.bind(this);
        this.update = this.update.bind(this);
        this.onDialogInputChange = this.onDialogInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.filterChange = this.filterChange.bind(this);
        this.sortChange = this.sortChange.bind(this);
        this.expandChange = this.expandChange.bind(this);
        this.toggle = this.toggle.bind(this); // UI related only
        this.toggleFade = this.toggleFade.bind(this);
        // emit repair read request via socket.io, and set the callback func to process the response
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
            filter: initialFilter,
            collapse: false,
            limit: this.defaultPageSize,
            sort: [],
            fadeIn: true,
            timeout: 300,
            skip: 0,
            data: [],
            allowUnsort: true,
            multiple: false,
            search: { ownership: 2 },
            pagerState: {
                info: true,
                type: "numeric",
                buttonCount: this.defaultButtonCount,
                pageSizes: [5, 10, 25, 50, 75, 100],
                previousNext: true,
                pageSize: this.defaultPageSize
            },
            docInEdit: undefined
        };
    }

    callbackRead(stringResponse) {
        const response = JSON.parse(stringResponse); // parse the response
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

        let pageSize = this.state.pageSize; // checkout the pagesize
        if (response.limit + response.skip < response.total) {
            pageSize = response.data.length;
        }

        this.setState({
            data: response.data.slice(0),
            total: response.total,
            skip: response.skip,
            fields: fields,
            pageSize: pageSize
        });
    }

    callbackSMS(strResp) {
        console.log("[Repair.callbackSMS] strResp:", strResp);
    }

    callbackDelete(strResp) {
        console.log("[Repair.callbackDelete] strResp:", strResp);
    }

    callbackSave(strResp) {
        console.log("[Repair.callbackSave] strResp:", strResp);
    }

    sortChange(e) {
        console.log("[Repair.sortChange] event.sort:", e.sort);
        this.setState({ sort: e.sort });
        console.log(
            "[Repair.sortChange] this.state.limit:",
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
                sort: e.sort
            }),
            this.callbackRead
        );
    }

    remove(dataItem) {
        console.log("[repair.remove] dataItem:", dataItem);

        alert("Confirm deleting: " + dataItem.lastname);

        const data = this.state.data.slice();
        const index = data.findIndex(p => p.requestId === dataItem.requestId);

        console.log("[repair.remove] index:", index, "data[i]:", data[index]);

        if (index !== -1) {
            data.splice(index, 1);
            this.setState({ data: data });
        }

        Socket.emit(
            "repair:delete",
            JSON.stringify({ id: dataItem.requestId }),
            this.callbackDelete
        );
    }

    onPageChange(e) {
        console.log(
            "[Repair.eventOnPageChange] e.page.skip:",
            e.page.skip,
            "e.page.limit:",
            e.page.limit
        );

        this.setState({ skip: e.page.skip, limit: e.page.take });
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
        this.setState({ filter: event.filter });

        console.log(
            "[Repair.filterChange] before emit read request, this.state.filter:",
            this.state.filter
        );
        this.setState({ filter: event.filter });

        console.log(
            "[Repair.filterChange] before emit read request, this.state.filter:",
            this.state.filter
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
        this.setState({ docInEdit: this.cloneDoc(dataItem) });
    }

    save() {
        const dataItem = this.state.docInEdit;
        const data = this.state.data.slice();

        if (dataItem.ProductID === undefined) {
            data.unshift(this.newProduct(dataItem));
        } else {
            const index = data.findIndex(
                p => p.ProductID === dataItem.ProductID
            );
            data.splice(index, 1, dataItem);
        }

        this.setState({ products: data, docInEdit: undefined });
    }

    cancel() {
        this.setState({ docInEdit: undefined });
    }

    insert() {
        this.setState({ docInEdit: {} });
    }

    onDialogInputChange(event) {
        const target = event.target;
        const value =
            target.type === "checkbox" ? target.checked : target.value;
        const name = target.props ? target.props.name : target.name;
        const edited = this.cloneDoc(this.state.docInEdit);

        edited[name] = value;
        this.setState({ docInEdit: edited });
    }

    updatePagerState(key, value) {
        console.log("[Repair.updatePagerState] key:", key, "value:", value);
        const newPagerState = Object.assign({}, this.state.pagerState, {
            [key]: value
        });
        this.setState(
            Object.assign({}, this.state, { pagerState: newPagerState })
        );
    }

    updateOwnerState(key, value) {
        console.log("[Repair.updateOwnerState] key:", key, "value:", value);
        this.setState({
            search: Object.assign(this.state.search, {
                ownership: parseInt(value, 10)
            })
        });
        console.log(
            "[Repair.updateOwnerState] after update",
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
        console.log("[Repair.expandChange] event:", event);
        event.dataItem.expanded = !event.dataItem.expanded;
        this.forceUpdate();
    }

    itemChange(dataItem, field, value) {
        console.log(
            "[Repair.itemChange] dataItem.cp:",
            dataItem.cp,
            ", dataItem.pp:",
            dataItem.pp,
            ", field:",
            field,
            ", value:",
            value
        );
        const updatedData = this.state.data.slice();
        const item = this.update(updatedData, dataItem);
        item[field] = value;
        this.setState({ data: updatedData });
        Socket.emit(
            "repair:save",
            JSON.stringify({
                requestId: item.requestId,
                pp: item.pp,
                cp: item.cp
            }),
            this.callbackSave
        );
    }

    update(data, item) {
        console.log(
            "[Repair.update] item.cp:",
            item.cp,
            "item.pp:",
            item.pp,
            "data.len:",
            data.length
        );
        let updated;
        let idx = data.findIndex(
            p =>
                p === item || (item.requestId && p.requestId === item.requestId)
        );
        console.log("[Repair.update] index:", idx);
        if (idx >= 0) {
            updated = Object.assign({}, item);
            data[idx] = updated;
            console.log(
                "[Repair.update] data[index].cp:",
                data[idx].cp,
                "data[index].pp:",
                data[idx].pp
            );
        }
        return data[idx];
    }

    smsSender(dataItem, flag) {
        console.log("[Repair.smsSender] flag:", flag);

        let customer = false,
            provider = false;

        if (flag === "*") {
            (customer = true), (provider = true);
        } else if (flag == "customer") {
            customer = true;
        } else if (flag == "provider") {
            provider = true;
        } else {
            console.log("[Repair.smsSender] unknown flag:", flag, " return...");
            return;
        }

        console.log(
            "[Repair.smsSender] customer:",
            customer,
            "provider:",
            provider
        );
        Socket.emit(
            "repair:confirm-sms",
            JSON.stringify({
                id: dataItem.requestId,
                customer: customer,
                provider: provider
            }),
            this.callbackSMS
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
                            this.setState({ allowUnsort: e.target.checked })
                        }
                    />
                    <label
                        htmlFor="unsort"
                        className="k-checkbox-label"
                        style={{ lineHeight: "1.2", marginBottom: "1em" }}
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
                            this.setState({ multiple: e.target.checked })
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
                        value="numeric"
                        className="k-radio"
                        defaultChecked={true}
                        onChange={e => {
                            this.updatePagerState("type", e.target.value);
                        }}
                    />
                    <label
                        style={{ margin: "7px 3em 7px 0px", lineHeight: "1.2" }}
                        className="k-radio-label"
                        htmlFor="numeric"
                    >
                        Numeric&nbsp;
                    </label>
                    <input
                        type="radio"
                        name="pager"
                        id="input"
                        value="input"
                        className="k-radio"
                        onChange={e => {
                            this.updatePagerState("type", e.target.value);
                        }}
                    />
                    <label
                        style={{ margin: "7px 3em 7px 0px", lineHeight: "1.2" }}
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
                Repair Grid State Form<div className="card-header-actions">
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
                <div className="col-md-3">{filterState}</div>
                <div className="col-md-3">{pagerTypeState}</div>
                <div className="col-md-3">{infoState}</div>
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
        const cellWithCheckBox = function (onChange, value) {
            return class CheckBox extends GridCell {
                constructor(props) {
                    super(props);
                    this.value = value;
                    this.handleChange = this.handleChange.bind(this);
                    this.onChange = onChange;
                }
                handleChange(e) {
                    let value;
                    if (this.props.field === "cp") {
                        value = !this.props.dataItem.cp;
                        // this.props.dataItem.cp = value;
                    } else if (this.props.field === "pp") {
                        value = !this.props.dataItem.pp;
                        // this.props.dataItem.pp = value;
                    }
                    console.log(
                        "[Repair.cellWithCheckBox] field:",
                        this.props.field,
                        "value:",
                        value,
                        "dataItem.cp:",
                        this.props.dataItem.cp,
                        "dataItem.pp:",
                        this.props.dataItem.pp
                    );
                    this.props.onChange({
                        dataItem: this.props.dataItem,
                        field: this.props.field,
                        syntheticEvent: e.syntheticEvent,
                        value: !e.target.value
                    });
                    this.onChange(this.props.dataItem, this.props.field, value);
                }
                render() {
                    let checked = "";
                    // console.log("[render] value:", value, this.value)
                    if (this.value === "cp") {
                        if (this.props.dataItem.cp === true) {
                            checked = "checked";
                        }
                    } else if (this.value === "pp") {
                        if (this.props.dataItem.pp === true) {
                            checked = "checked";
                        }
                    }
                    const id = this.value + "_" + this.props.dataItem.requestId;
                    // TODO: These styles should be changed in future,
                    // border-color: black!important;
                    // should be assigned.
                    // .k-checkbox-label:after, .k-checkbox-label:before, .k-radio-label:after, .k-radio-label:before
                    return (
                        <td style={{ paddingLeft: "10px" }}>
                            {/* <input type='checkbox' className='k-checkbox' {this.state.value} {this.state.status}/> */}
                            <input
                                id={id}
                                className="k-checkbox"
                                type="checkbox"
                                checked={checked}
                                onChange={this.handleChange}
                            />
                            <label htmlFor={id} className="k-checkbox-label" />
                        </td>
                    );
                }
            };
        };
        const grid = (
            <Grid
                data={this.state.data}
                style={{ maxHeight: "750px" }}
                // detail={DetailComponent} expandField='expanded' expandChange={this.expandChange}
                skip={this.state.skip}
                total={this.state.total}
                pageable={this.state.pagerState}
                pageSize={this.state.pageSize}
                filterable={true}
                editField="inEdit"
                filter={this.state.filter}
                filterChange={this.filterChange}
                sort={this.state.sort}
                sortChange={this.sortChange} // onChange={this.itemChange}
                sortable={{
                    allowUnsort: this.state.allowUnsort,
                    mode: this.state.multiple ? "multiple" : "single"
                }}
                pageChange={this.onPageChange.bind(this)}
            >
                <Column
                    title="Remove"
                    cell={cellWithEditing(null, this.remove)}
                    filterable={false}
                    sortable={false}
                    width="110px"
                />
                <Column
                    title="Confirm SMS"
                    cell={cellWithSMS(this.smsSender)}
                    filterable={false}
                    sortable={false}
                    width="120px"
                />
                <Column field="requestId" title="ID" width="150px" />
                <Column
                    field="providerId"
                    title="ProviderID"
                    width="97px"
                    cell={cellWithLink(Server.Addr + "/#/service-center/")}
                />
                <Column field="firstname" title="Firstname" width="200px" />
                <Column field="lastname" title="Lastname" width="200px" />
                <Column field="description" title="Description" width="200px" />
                <Column
                    field="cp"
                    editable={true}
                    editor="boolean"
                    filter="boolean"
                    title="CustomerPaid"
                    width="120px"
                    cell={cellWithCheckBox(this.itemChange, "cp")}
                />
                <Column
                    field="pp"
                    editable={true}
                    editor="boolean"
                    filter="boolean"
                    title="ProviderPaid"
                    width="120px"
                    cell={cellWithCheckBox(this.itemChange, "pp")}
                />
                <Column field="description" title="Description" width="200px" />
                <Column field="createdAt" title="CreatedAt" width="200px" />
                <Column field="model" title="Model" width="200px" />
                <Column field="lpn" title="LPN" width="200px" />
                <Column field="date" title="Date" width="200px" />
                <Column field="time" title="Time" width="200px" />
                <Column field="mobile" title="Mobile" width="200px" />
                <Column field="voucher" title="Voucher" width="200px" />
                <Column field="service" title="Service" width="200px" />
                <Column field="latitude" title="Latitude" width="200px" />
                <Column field="longitude" title="Longitude" width="200px" />
            </Grid>
        );
        return (
            <div>
                {columnCard}
                {grid}
            </div>
        );
    }
    cloneDoc(doc) {
        return Object.assign({}, doc);
    }
}
const cellWithEditing = function (edit, remove) {
    return class extends GridCell {
        render() {
            return (
                <td>
                    {/* <button className='k-primary k-button k-grid-edit-command' onClick={() => { edit(this.props.dataItem); }}>Edit</button>&nbsp; */}
                    <button
                        className="k-button k-grid-remove-command"
                        onClick={() => {
                            remove(this.props.dataItem);
                        }}
                    >
                        Remove
                    </button>
                </td>
            );
        }
    };
};

export default Repair;
