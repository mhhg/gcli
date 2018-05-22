import React from "react";
import {
  Grid,
  GridColumn,
  GridCell,
  GridToolbar
} from "@progress/kendo-react-grid";
import { DropDownList } from "@progress/kendo-react-dropdowns";
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

// import { sampleProducts } from './sample-products.jsx';

class DropDownCell extends GridCell {
  constructor(props) {
    super(props);
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
      <img src="" />
    );

    // const value = this.props.dataItem[this.props.field];

    // if (!this.props.dataItem.inEdit) {
    //   return (
    //     <td>
    //       {value === null
    //         ? ""
    //         : this.props.dataItem[this.props.field].toString()}
    //     </td>
    //   );
    // }

    // return (
    //   <td>
    //     <DropDownList
    //       style={{ width: "100px" }}
    //       onChange={this.handleChange.bind(this)}
    //       value={value}
    //       data={[
    //         { text: "yes", value: true },
    //         { text: "no", value: false },
    //         { text: "(empty)", value: null }
    //       ]}
    //       valueField="value"
    //       textField="text"
    //     />
    //   </td>
    // );
  }
}

let responseProviders = [];

class User extends React.Component {
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
          <td>
            <button
              className="k-primary k-button k-grid-edit-command btn-xs"
              onClick={() => enterEdit(this.props.dataItem)}
            >
              Edit
            </button>
            <button
              className="k-button k-grid-remove-command btn-xs"
              onClick={() =>
                window.confirm(
                  "Confirm deleting: " + this.props.dataItem.name
                ) && remove(this.props.dataItem)
              }
            >
              Remove
            </button>
          </td>
        ) : (
          <td>
            <button
              className="k-button k-grid-save-command btn-sm"
              onClick={() => save(this.props.dataItem)}
            >
              {this.props.dataItem.id ? "Update" : "Add"}
            </button>
            <button
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

    console.log(
      "[User.funcResponseCallback] response.users:",
      response
    );

    if (response === null) {
      // TODO: handle this issue by a timeout and
      // calling the pull request again
      return;
    } else if (response.code !== 200) {

      return
    }

    let fields = [];
    if (response.users.length > 0) {
      fields = Object.getOwnPropertyNames(response.users[0]).slice(0, 10);
    }

    // set the responseProvider variable as a clone of the handler response
    responseProviders = response.users.slice(0);

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
    }
  }

  callbackDelete(stringResponse) {
    console.log("[User.callbackDelete] stringResponse: ", stringResponse);
  }

  enterInsert() {
    const dataItem = {
      inEdit: true,
      Discontinued: false
    };

    console.log("[User.enterInsert] dataItem:", dataItem);

    const newUsers = this.state.data.slice();
    newUsers.unshift(dataItem);

    this.update(newUsers, dataItem);

    this.setState({
      data: newUsers
    });
  }

  enterEdit(dataItem) {
    console.log("[User.enterEdit] dataItem:", dataItem);

    this.update(this.state.data, dataItem).inEdit = true;
    this.setState({
      data: this.state.data.slice()
    });
  }

  save(dataItem) {
    console.log("[User.save] before calling update. dataItem:", dataItem);

    dataItem.inEdit = undefined;
    dataItem.id = this.update(responseProviders, dataItem).id;

    this.setState({
      data: this.state.data.slice()
    });
    console.log("[User.save] after calling update. dataItem:", dataItem);

    Socket.emit("user:save", JSON.stringify(dataItem), this.callbackSave);
  }

  cancel(dataItem) {
    console.log("[User.cancel] dataItem:", dataItem);

    if (dataItem.id) {
      let originalItem = responseProviders.find(p => p.id === dataItem.id);
      this.update(this.state.data, originalItem);
    } else {
      this.update(this.state.data, dataItem, !dataItem.id);
    }
    this.setState({
      data: this.state.data.slice()
    });
  }

  remove(dataItem) {
    console.log("[User.remove] dataItem:", dataItem);

    dataItem.inEdit = undefined;

    this.update(this.state.data, dataItem, true);
    this.update(responseProviders, dataItem, true);

    this.setState({
      data: this.state.data.slice()
    });

    Socket.emit(
      "user:delete",
      JSON.stringify({
        id: dataItem.id
      }),
      this.callbackDelete
    );
  }

  update(data, item, remove) {
    console.log("[User.update] item:", item, "remove:", remove);

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
        sort: this.state.sort
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
        filter: this.state.filter,
        sort: this.state.sort
      }),
      this.callbackRead
    );
  }

  onPageChange(e) {
    console.log(
      "[User.eventOnPageChange] e.page.skip:",
      e.page.skip,
      "e.page.limit:",
      e.page.limit
    );

    this.setState({
      skip: e.page.skip,
      limit: e.page.take
    });

    Socket.emit(
      "user:read",
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
    console.log("[User.funcUpdatePagerState] key:", key, "value:", value);

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
    console.log("[User.funcUpdateOwnershipState] key:", key, "value:", value);

    this.setState({
      search: Object.assign(this.state.filter, {
        ownership: parseInt(value, 10)
      })
    });

    console.log(
      "[User.funcUpdateOwnershipState] after update",
      "this.state.objectSearchState:",
      this.state.filter
    );

    Socket.emit(
      "user:read",
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

  render() {
    return (
      <div>
        <Col
          xs="12"
          sm="12"
          md="12"
          style={{
            padding: "0px",
            marginBottom: "5px"
          }}
        >
          <Fade timeout={this.state.timeout} in={this.state.fadeIn}>
            <Card
              className="card-accent-primary"
              style={{
                padding: "0px",
                marginBottom: "5px"
              }}
            >
              <CardHeader>
                Users Grid State Form
                <div className="card-header-actions">
                  {/* <a href="#" className="card-header-action btn btn-setting"><i className="icon-settings"></i></a> */}
                  <a
                    className="card-header-action btn btn-minimize"
                    data-target="#collapseExample"
                    onClick={this.toggle}
                  >
                    <i className="icon-arrow-up" />
                  </a>
                  {/* <a className="card-header-action btn btn-close" onClick={this.toggleFade}><i className="icon-close"></i></a> */}
                </div>
              </CardHeader>
              <Collapse isOpen={this.state.collapse} id="collapseExample">
                <CardBody>
                  <div className="example-config row">
                    <div className="col-md-12 row">
                      {/* <div className="col-md-3">
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
                              defaultChecked={true}
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
                      </div> */}
                      <div className="col-md-2">
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
                        {/* </div> */}
                      </div>
                      <div className="col-md-2">
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
                      </div>
                      <div className="col-md-2">
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
                          <label
                            htmlFor="showInfo"
                            className="k-checkbox-label"
                          >
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
                          <label
                            htmlFor="pageSize"
                            className="k-checkbox-label"
                          >
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
                      </div>
                      <div className="col-md-3">
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
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Collapse>
            </Card>
          </Fade>
        </Col>
        <Grid
          data={this.state.data}
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
          sortable={{
            allowUnsort: this.state.allowUnsort,
            mode: this.state.multiple ? "multiple" : "single"
          }}
          sort={this.state.sort}
          sortChange={this.sortChange}
        >
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
                onClick={() =>
                  this.setState({ data: responseProviders.slice() })
                }
              >
                Cancel current changes
              </button>
            )}
          </GridToolbar>
          <GridColumn field="id" title="ID" editable={false} width="150px" />
          <GridColumn
            field="imageId"
            title="Image"
            editable={false}
            width="150px"
            // cell={
            //   '<img src="http://repo.reglazh.com/assets/images/markers/cat-%D9%85%DA%A9%D8%A7%D9%86%DB%8C%DA%A9%DB%8C.svg" alt="image" />'
            // }
            // cell={DropDownCell}
          />
          <GridColumn field="firstname" title="FirstName" width="200px" />
          <GridColumn field="lastname" title="LastName" width="200px" />
          <GridColumn field="username" title="Username" width="200px" />
          <GridColumn
            field="confirmed"
            title="Confirmed"
            width="200px"
            editor="boolean"
            filter="boolean"
          />
          <GridColumn
            field="isAdmin"
            title="IsAdmin"
            width="200px"
            editor="boolean"
            filter="boolean"
          />
          <GridColumn
            field="gender"
            title="Gender"
            width="200px"
            editable={false}
          />
          <GridColumn field="nationalId" title="NationalID" width="200px" />
          <GridColumn field="middlename" title="Middlename" width="200px" />
          <GridColumn
            field="email"
            title="Email"
            width="200px"
            editor={"email"}
          />
          <GridColumn field="address" title="Address" width="200px" />
          {/* <GridColumn field="ProductID" title="Id" width="50px" editable={false} />
          <GridColumn field="ProductName" title="Product Name" />
          <GridColumn field="FirstOrderedOn" title="First Ordered" 
            editor="date" format="{0:d}" />
          <GridColumn field="UnitsInStock" title="Units" editor="numeric" />
          <GridColumn field="Discontinued" cell={DropDownCell} /> */}
          <GridColumn
            cell={this.CommandCell}
            width="235px"
            sortable={false}
            filterable={false}
          />
        </Grid>
      </div>
    );
  }
}

export default User;
