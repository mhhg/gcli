import { Grid, GridCell,  GridColumn as Column, GridToolbar } from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React from "react";
import { Card, CardBody, CardHeader, Col, Collapse, Fade, Row } from "reactstrap";
import Socket from "../../socket";
import AvatarCell from "./AvatarCell";
import cellWithCheckBox from "./CellWithCheckBox";
import Dialog from "./Dialog";

class User extends React.Component {
  constructor(props) {
    super(props);
    const initialFilter = { logic: "and", filters: [] };
    // bind state to callback events which will be triggered when the server response fetched
    this.callbackRead = this.callbackRead.bind(this);
    this.callbackSave = this.callbackSave.bind(this);
    this.callbackDelete = this.callbackDelete.bind(this);
    this.updateOwnerState = this.updateOwnerState.bind(this);
    this.expandChange = this.expandChange.bind(this);
    this.edit = this.edit.bind(this);
    this.save = this.save.bind(this);
    this.remove = this.remove.bind(this);
    this.cancel = this.cancel.bind(this);
    this.insert = this.insert.bind(this);
    this.onDialogInputChange = this.onDialogInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.filterChange = this.filterChange.bind(this); // bind events to state
    this.sortChange = this.sortChange.bind(this);
    this.toggle = this.toggle.bind(this); // UI related only
    this.toggleFade = this.toggleFade.bind(this);
    Socket.emit("user:read", JSON.stringify({
      skip: 0, limit: 40, search: { ownership: 2 },
      filter: initialFilter, sort: []
    }), this.callbackRead);
    this.state = {
      allowUnsort: true, multiple: false, filter: initialFilter,
      search: { ownership: 2 }, sort: [], data: [], docInEdit: undefined,
      pagerState: {
        info: true, type: "numeric",
        pageSizes: [5, 10, 25, 50, 75, 100], previousNext: true,
        pageSize: this.defaultPageSize, buttonCount: this.defaultButtonCount
      },
    };
  }
  callbackRead(stringResponse) {
    const response = JSON.parse(stringResponse); // parse the response
    console.log("[User.callbackRead] response:", response);
    if (response === null) {
      return;
      // TODO: handle this issue by a timeout and
      // calling the pull request again
    } else if (response.code !== 200) {
      return;
    }
    // checkout the pagesize
    let pageSize = this.state.pageSize;
    if (response.limit + response.skip < response.total) {
      pageSize = response.users.length;
    }
    this.setState({
      total: response.total, skip: response.skip,
      data: response.users.slice(0), pageSize: pageSize
    });
  }
  callbackDelete(stringResponse) {
    console.log("[data.callbackDelete] stringResponse: ", stringResponse);
  }
  handleSubmit(event) {
    event.preventDefault();
  }
  edit(dataItem) {
    this.setState({ docInEdit: this.cloneUser(dataItem) });
  }
  remove(dataItem) {
    // dataItem.inEdit = undefined;
    console.log("[user.remove] dataItem:", dataItem);
    alert('Confirm deleting: ' + dataItem.name);
    const data = this.state.data.slice();
    const index = data.findIndex(p => p.id === dataItem.id);
    if (index !== -1) {
      data.splice(index, 1);
      this.setState({ data: data });
    }
    Socket.emit("user:delete", JSON.stringify({
      id: dataItem.id
    }), this.callbackDelete);
  }
  callbackSave(stringResponse) {
    let response = JSON.parse(stringResponse);
    console.log("[Grid.callbackSave] response:", response);
    const dataItem = this.state.docInEdit;
    const data = this.state.data.slice();
    if (dataItem.id === undefined) {
      // products.unshift(this.newDoc(dataItem));
      return;
    } else {
      const index = data.findIndex(p => p.id === dataItem.id);
      data.splice(index, 1, dataItem);
    }
    this.setState({ data: data, docInEdit: undefined });
  }
  save() {
    const dataItem = this.state.docInEdit;
    Socket.emit("user:save", JSON.stringify(dataItem), this.callbackSave);
  }
  cancel() {
    this.setState({ docInEdit: undefined });
  }
  insert() {
    this.setState({ docInEdit: {} });
  }
  onDialogInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.props ? target.props.name : target.name;
    const edited = this.cloneUser(this.state.docInEdit);
    edited[name] = value;
    console.log("[Grid.onDialogInputChange] edited:", edited, "name:", name, "value:", value);
    this.setState({ docInEdit: edited });
  }
  dialogTitle() {
    return `${
      this.state.docInEdit.id === undefined ? "Add" : "Edit"
      } User`;
  }
  cloneUser(data) {
    return Object.assign({}, data);
  }
  newDoc(source) {
    const newDoc = {
      imageId: "", confirmed: false, isAdmin: false, firstname: "", lastname: "",
      middlename: "", username: "", email: "", address: "", gender: "",
      nationalId: ""
    };
    return Object.assign(newDoc, source);
  }
  updateOwnerState(key, value) {
    console.log("[User.funcUpdateOwnershipState] key:", key, "value:", value);
    this.setState({
      search: Object.assign(this.state.search, {
        ownership: parseInt(value, 10)
      })
    });
    console.log("[User.funcUpdateOwnershipState] after update", "this.state.objectSearchState:", this.state.filter);
    Socket.emit("user:read", JSON.stringify({
      skip: 0, limit: this.defaultPageSize,
      search: this.state.search, filter: this.state.filter,
      sort: this.state.sort
    }), this.callbackRead);
  }
  onPageChange(e) {
    console.log("[User.eventOnPageChange] e.page.skip:", e.page.skip, "e.page.limit:", e.page.limit);
    this.setState({ skip: e.page.skip, limit: e.page.take });
    Socket.emit("user:read", JSON.stringify({
      skip: e.page.skip, limit: e.page.take, search: this.state.search,
      filter: this.state.filter, sort: this.state.sort
    }), this.callbackRead);
  }
  updatePagerState(key, value) {
    console.log("[User.funcUpdatePagerState] key:", key, "value:", value);
    const newPagerState = Object.assign({}, this.state.pagerState, { [key]: value });
    this.setState(
      Object.assign({}, this.state, {
        pagerState: newPagerState
      })
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
  filterChange(event) {
    this.setState({ filter: event.filter });
    Socket.emit("user:read", JSON.stringify({
      skip: this.state.skip, limit: this.state.limit, search: this.state.search,
      filter: event.filter, sort: this.state.sort
    }), this.callbackRead);
  }
  sortChange(event) {
    console.log("[User.sortChange] event.sort:", event.sort);
    this.setState({ sort: event.sort });
    console.log("[User.sortChange] this.state.limit:", this.state.limit, "this.state.skip:", this.state.skip);
    Socket.emit("user:read", JSON.stringify({
      skip: this.state.skip, limit: this.state.limit,
      search: this.state.search, filter: this.state.filter, sort: event.sort
    }), this.callbackRead);
  }
  render() {
    const cellWithEditing = function (edit, remove) {
      return class extends GridCell {
        render() {
          const cell = (<td>
            <button className="k-primary k-button k-grid-edit-command" onClick={() => { edit(this.props.dataItem); }}>Edit</button>&nbsp;
            <button className="k-button k-grid-remove-command" onClick={() => { remove(this.props.dataItem); }}>Remove</button>
          </td>)
          return cell;
        }
      };
    }
    const grid = (
      <Grid data={this.state.data} style={{ maxHeight: "750px" }}
        filterable={true} filter={this.state.filter} filterChange={this.filterChange}
        pageChange={this.onPageChange.bind(this)}
        skip={this.state.skip} total={this.state.total}
        pageable={this.state.pagerState} pageSize={this.state.pageSize}
        sort={this.state.sort} sortChange={this.sortChange}
        sortable={{
          allowUnsort: this.state.allowUnsort,
          mode: this.state.multiple ? "multiple" : "single"
        }}
      ><GridToolbar>
          <button onClick={this.insert} className="k-button">Add New</button>
        </GridToolbar>
        <Column title="" editable={false} sortable={false} filterable={false}
          cell={cellWithEditing(this.edit, this.remove)} width="169px" />
        <Column field="id" title="ID" editable={false} width="150px" />
        <Column field="imageId" title="Image" editable={false}
          sortable={false} filterable={false} width="73px" cell={AvatarCell} />
        <Column field="username" title="Username" width="200px" />
        <Column field="firstname" title="FirstName" width="200px" />
        <Column field="lastname" title="LastName" width="200px" />
        <Column field="confirmed" title="Confirmed" width="200px" editor="boolean"
          filter="boolean" cell={cellWithCheckBox("confirmed")} />
        <Column field="isAdmin" title="IsAdmin" width="200px" editor="boolean"
          filter="boolean" cell={cellWithCheckBox("isAdmin")} />
        <Column field="gender" title="Gender" width="200px" />
        <Column field="nationalId" title="NationalID" width="200px" />
        <Column field="middlename" title="Middlename" width="200px" />
        <Column field="email" title="Email" width="200px" editor={"email"} />
        <Column field="address" title="Address" width="200px" />
        <Column field="id" title="ID" editable={false} width="150px" />
      </Grid>
    );
    const dialog = this.state.docInEdit && (
      <Dialog title={this.dialogTitle()} close={this.cancel} ok={this.save}
        cancel={this.cancel}>
        <form className="row k-form" onSubmit={this.handleSubmit}>
          <div style={{ marginBottom: "1rem" }} className="col-md-6">
            <label>Username<br />
              <Input className="form-control" type="text" name="username"
                value={this.state.docInEdit.username || ""}
                onChange={this.onDialogInputChange} />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }} className="col-md-6">
            <label>Firstname<br />
              <Input className="form-control" type="text"
                name="firstname" value={this.state.docInEdit.firstname || ""}
                onChange={this.onDialogInputChange} />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }} className="col-md-6">
            <label>Lastname<br />
              <Input className="form-control" type="text" name="lastname"
                value={this.state.docInEdit.lastname || ""}
                onChange={this.onDialogInputChange} />
            </label>
          </div>
          <div className="col-md-6 k-form-field" style={{ marginBottom: "1rem" }}>
            <input id="ch1" className="k-checkbox form-control" type="checkbox"
              name="confirmed" checked={this.state.docInEdit.confirmed || ""}
              onChange={this.onDialogInputChange} />
            <label className="k-checkbox-label" htmlFor="ch1">confirmed<br /></label>
          </div>
          <div className="col-md-6 k-form-field" style={{ marginBottom: "1rem" }}>
            <input id="ch2" className="k-checkbox form-control" type="checkbox"
              name="isAdmin" checked={this.state.docInEdit.isAdmin || ""}
              onChange={this.onDialogInputChange} />
            <label className="k-checkbox-label" htmlFor="ch2">isAdmin<br /></label>
          </div>
          <div style={{ marginBottom: "1rem" }} className="col-md-6">
            <label>gender<br /><Input className="form-control" type="text" name="gender"
              value={this.state.docInEdit.gender || ""} onChange={this.onDialogInputChange} />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }} className="col-md-6">
            <label>nationalId<br />
              <Input className="form-control" type="text" name="nationalId"
                value={this.state.docInEdit.nationalId || ""}
                onChange={this.onDialogInputChange} />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }} className="col-md-6">
            <label>middlename<br /><Input className="form-control" type="text"
              name="middlename" value={this.state.docInEdit.middlename || ""}
              onChange={this.onDialogInputChange} /></label>
          </div>
          <div style={{ marginBottom: "1rem" }} className="col-md-6">
            <label>email<br />
              <Input className="form-control" type="text" name="email"
                value={this.state.docInEdit.email || ""}
                onChange={this.onDialogInputChange} /></label>
          </div>
          <div style={{ marginBottom: "1rem" }} className="col-md-6">
            <label>Address<br /> <Input className="form-control" type="text"
              name="address" value={this.state.docInEdit.address || ""}
              onChange={this.onDialogInputChange} /></label>
          </div>
        </form>
      </Dialog>
    );
    const ownershipState = (
      <dl>
        <dt>Ownership status filter:</dt>
        <dd>
          <input type="radio" name="ownership" id="ownershipTemplate" className="k-radio"
            value="1" onChange={e => { this.updateOwnerState("type", e.target.value); }} />
          <label style={{ margin: "7px 3em 7px 0px", lineHeight: "1.2" }}
            className="k-radio-label" htmlFor="ownershipTemplate" >Template (Excel)&nbsp;
          </label>
          <input defaultChecked={true} type="radio" name="ownership"
            id="ownershipRegistered" className="k-radio" value="2"
            onChange={e => { this.updateOwnerState("type", e.target.value); }} />
          <label style={{ margin: "7px 3em 7px 0px", lineHeight: "1.2" }}
            className="k-radio-label" htmlFor="ownershipRegistered" >
            Registered&nbsp; </label>
          <input type="radio" name="ownership" id="ownershipAll" className="k-radio"
            value="0" onChange={e => { this.updateOwnerState("type", e.target.value); }} />
          <label style={{ margin: "7px 3em 7px 0px", lineHeight: "1.2" }}
            className="k-radio-label" htmlFor="ownershipAll" >All&nbsp;</label>
        </dd>
      </dl>
    );
    const filterState = (
      <dl>
        <dt>Filter state:</dt>
        <dd>
          <input type="checkbox" className="k-checkbox" id="unsort" checked={this.state.allowUnsort}
            onChange={e => this.setState({ allowUnsort: e.target.checked })} />
          <label htmlFor="unsort" className="k-checkbox-label"
            style={{ lineHeight: "1.2", marginBottom: "1em" }} >
            Enable UnSorting</label><br />
          <input type="checkbox" className="k-checkbox" id="multiSort"
            checked={this.state.multiple} onChange={e => this.setState({
              multiple: e.target.checked
            })} />
          <label htmlFor="multiSort" className="k-checkbox-label"
            style={{ lineHeight: "1.2" }} >Enable multiple columns sorting</label>
        </dd>
      </dl>
    );
    const pagerTypeState = (
      <dl>
        <dt>Pager type:</dt>
        <dd>
          <input type="radio" name="pager" id="numeric" className="k-radio"
            value="numeric" defaultChecked={true}
            onChange={e => { this.updatePagerState("type", e.target.value); }} />
          <label style={{ margin: "7px 3em 7px 0px", lineHeight: "1.2" }}
            className="k-radio-label" htmlFor="numeric">Numeric&nbsp;</label>
          <input type="radio" name="pager" id="input" className="k-radio" value="input"
            onChange={e => { this.updatePagerState("type", e.target.value); }} />
          <label style={{ margin: "7px 3em 7px 0px", lineHeight: "1.2" }}
            className="k-radio-label" htmlFor="input" >Input&nbsp;</label>
        </dd>
      </dl>
    );
    const infoState = (
      <dl>
        <dd>
          <div className="col-md-12">
            <input className="k-checkbox" defaultChecked={true} id="showInfo" type="checkbox"
              onChange={e => { this.updatePagerState("info", e.target.checked); }} />
            <label htmlFor="showInfo" className="k-checkbox-label">Show info</label>
          </div>
          <div className="col-md-12">
            <input className="k-checkbox" defaultChecked={true} id="pageSize" type="checkbox"
              onChange={e => { this.updatePagerState("pageSizes", e.target.checked); }} />
            <label htmlFor="pageSize" className="k-checkbox-label">Show page sizes</label>
          </div>
          <div className="col-md-12">
            <input className="k-checkbox" defaultChecked={true} type="checkbox" id="previousNext"
              onChange={e => { this.updatePagerState("previousNext", e.target.checked); }} />
            <label htmlFor="previousNext" className="k-checkbox-label" >
              Show previous / next buttons</label>
          </div>
        </dd>
      </dl>
    );
    const buttonsState = (
      <dl>
        <dt>Max. number of buttons:</dt>
        <dd>
          <input defaultValue="5" className="k-textbox" type="number"
            onChange={e => { this.updatePagerState("buttonCount", e.target.valueAsNumber); }} />
        </dd>
      </dl>
    );
    const cardHeader = (
      <CardHeader>Users Grid State Form
        <div className="card-header-actions">
          <a onClick={this.toggle} className="card-header-action btn btn-minimize"
            data-target="#collapseExample"><i className="icon-arrow-up" /></a>
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
      <Card className="card-accent-primary" style={{ padding: "0px", marginBottom: "5px" }}>
        {cardHeader}
        <Collapse isOpen={this.state.collapse} id="collapseExample">
          <CardBody><div className="example-config row">{cardBody}</div></CardBody>
        </Collapse>
      </Card>
    );
    const columnCard = (
      <Col md="12" style={{ padding: "0px", marginBottom: "5px" }}>
        <Fade timeout={this.state.timeout} in={this.state.fadeIn}>{card}</Fade>
      </Col>
    );
    return (
      <div>
        {columnCard}
        {grid}
        <Row>
          <Col md="12" style={{ padding: "0px", marginBottom: "5px" }} >{dialog}</Col>
        </Row>
      </div>
    );
  }
}

export default User;