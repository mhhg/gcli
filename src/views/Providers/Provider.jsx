import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { Input } from '@progress/kendo-react-inputs';
import React from 'react';
import { Card, CardBody, CardHeader, Col, Collapse, Fade, Row } from 'reactstrap';
import Socket from '../../socket';
import AvatarCell from './AvatarCell';
import CellWithEditing from './CellWithEditing.jsx';
import DetailComponent from './DetailComponent';
import Dialog from './Dialog';

class Provider extends React.Component {
    constructor(props) {
        super(props);
        const initialFilter = { logic: 'and', filters: [] }; // set initial filter state
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
        this.toggle = this.toggle.bind(this);         // UI related only
        this.toggleFade = this.toggleFade.bind(this);
        Socket.emit('provider:read', JSON.stringify({ // emit initial request
            skip: 0, limit: 40, search: { ownership: 2 },
            filter: initialFilter, sort: []
        }), this.callbackRead);
        this.state = {
            allowUnsort: true, multiple: false,
            pagerState: {
                info: true, type: 'numeric',
                pageSizes: [5, 10, 25, 50, 75, 100],
                previousNext: true,
                pageSize: this.defaultPageSize,
                buttonCount: this.defaultButtonCount
            },
            filter: initialFilter,
            search: { ownership: 2 },
            sort: [],
            docInEdit: undefined
        };
    }
    callbackRead(stringResponse) {
        const response = JSON.parse(stringResponse); // parse the response
        console.log('[Provider.callbackRead] response:', response);
        if (response === null) {
            return;
            // TODO: handle this issue by a timeout and
            // calling the pull request again
        } else if (response.code !== 200) {
            return;
        }
        let pageSize = this.state.pageSize; // checkout the pagesize
        if (response.limit + response.skip < response.total) {
            pageSize = response.providers.length;
        }
        this.setState({
            total: response.total, skip: response.skip,
            data: response.providers.slice(0), pageSize: pageSize
        });
    }
    callbackDelete(strResp) {
        console.log('[Provider.callbackDelete] strResp: ', strResp);
    }
    handleSubmit(event) {
        event.preventDefault();
    }
    edit(dataItem) {
        this.setState({ docInEdit: this.cloneDocument(dataItem) });
    }
    remove(dataItem) {
        // dataItem.inEdit = undefined;
        console.log('[provider.remove] dataItem:', dataItem);
        alert('Confirm deleting: ' + dataItem.name);
        const data = this.state.data.slice();
        const index = data.findIndex(p => p.id === dataItem.id);
        if (index !== -1) {
            data.splice(index, 1);
            this.setState({ data: data });
        }
        Socket.emit('provider:delete',
            JSON.stringify({ id: dataItem.id }), this.callbackDelete);
    }
    callbackSave(stringResponse) {
        let response = JSON.parse(stringResponse);
        console.log('[Grid.callbackSave] response:', response);
        const dataItem = this.state.docInEdit;
        const data = this.state.data.slice();
        if (dataItem.id === undefined) {
            // data.unshift(this.newProduct(dataItem));
            return;
        } else {
            const index = data.findIndex(p => p.id === dataItem.id);
            data.splice(index, 1, dataItem);
        }
        this.setState({ data: data, docInEdit: undefined });
    }
    save() {
        const dataItem = this.state.docInEdit;
        Socket.emit('provider:save', JSON.stringify(dataItem), this.callbackSave);
    }
    cancel() {
        this.setState({ docInEdit: undefined });
    }
    insert() {
        this.setState({ docInEdit: {} });
    }
    onDialogInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.props ? target.props.name : target.name;
        const edited = this.cloneDocument(this.state.docInEdit);
        edited[name] = value;
        console.log('[Providers.onDialogInputChange] edited:', edited, 'name:', name, 'value:', value);
        this.setState({ docInEdit: edited });
    }
    dialogTitle() {
        return `${
            this.state.docInEdit.id === undefined ? 'Add' : 'Edit'
            } provider`;
    }
    cloneDocument(provider) {
        return Object.assign({}, provider);
    }
    newProvider(source) {
        const doc = {
            imageId: '', ownerId: '',
            isConfirmed: false,
            latitude: 0.0, longitude: 0.0,
            name: '', description: '', mobile: '', background: '',
            categories: [], phoneNumbers: [],
            membersCount: 0, advertisement: '', attachments: []
        };
        return Object.assign(doc, source);
    }
    generateId() {
        let id = 1;
        this.state.data.forEach(p => { id = Math.max((p.id || 0) + 1, id); });
        return id;
    }
    updateOwnerState(key, value) {
        console.log('[Provider.funcUpdateOwnershipState] key:', key, 'value:', value);
        this.setState({
            search: Object.assign(this.state.search, {
                ownership: parseInt(value, 10)
            })
        });
        console.log('[Provider.updateOwnershipState] after update this.state.objectSearchState:', this.state.filter);
        Socket.emit('provider:read', JSON.stringify({
            skip: 0, limit: this.defaultPageSize,
            search: this.state.search, filter: this.state.filter,
            sort: this.state.sort
        }), this.callbackRead);
    }
    onPageChange(e) {
        console.log('[Provider.eventOnPageChange] e.page.skip:', e.page.skip, 'e.page.limit:', e.page.limit);
        this.setState({ skip: e.page.skip, limit: e.page.take });
        Socket.emit('provider:read', JSON.stringify({
            skip: e.page.skip, limit: e.page.take, search: this.state.search,
            filter: this.state.filter, sort: this.state.sort
        }), this.callbackRead);
    }
    updatePagerState(key, value) {
        console.log('[Provider.funcUpdatePagerState] key:', key, 'value:', value);
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
        console.log('[expandChange] event:', event);
        event.dataItem.expanded = !event.dataItem.expanded;
        this.forceUpdate();
    }
    filterChange(event) {
        this.setState({ filter: event.filter });
        Socket.emit('provider:read', JSON.stringify({
            skip: this.state.skip, limit: this.state.limit,
            search: this.state.search, filter: event.filter,
            sort: this.state.sort
        }), this.callbackRead);
    }
    sortChange(event) {
        console.log('[Provider.sortChange] event.sort:', event.sort);
        this.setState({ sort: event.sort });
        console.log('[Provider.sortChange] this.state.limit:', this.state.limit, 'this.state.skip:', this.state.skip);
        Socket.emit('provider:read', JSON.stringify({
            skip: this.state.skip, limit: this.state.limit,
            search: this.state.search, filter: this.state.filter,
            sort: event.sort
        }), this.callbackRead);
    }
    render() {
        const grid = (
            <Grid
                data={this.state.data} style={{ maxHeight: '750px' }}
                detail={DetailComponent}
                expandChange={this.expandChange} expandField="expanded"
                filterable={true} filter={this.state.filter} filterChange={this.filterChange}
                pageChange={this.onPageChange.bind(this)}
                skip={this.state.skip} total={this.state.total}
                pageable={this.state.pagerState} pageSize={this.state.pageSize}
                sort={this.state.sort} sortChange={this.sortChange}
                sortable={{
                    allowUnsort: this.state.allowUnsort,
                    mode: this.state.multiple ? 'multiple' : 'single'
                }}
            >
                <GridToolbar>
                    <button onClick={this.insert} className="k-button">Add New</button>
                </GridToolbar>
                <Column title="" editable={false} sortable={false} filterable={false}
                    cell={CellWithEditing(this.edit, this.remove)} width="169px"
                />
                <Column field="name" title="Name" width="230px" />
                <Column field="description" title="Description" />
                <Column field="address" title="Address" />
                <Column field="imageId" title="Image" editable={false}
                    sortable={false} filterable={false} cell={AvatarCell}
                    width="90px" />
                <Column field="isConfirmed" title="IsConfirmed" editor="boolean"
                    filter="boolean" width="150px" />
                <Column field="categories" title="Categories" editable={false}
                    sortable={false} width="200px" />
                <Column field="phoneNumbers" title="PhoneNumbers"
                    editable={false} width="200px" />
                <Column field="mobile" title="Mobile" width="200px" />
                <Column
                    field="membersCount"
                    title="Members No"
                    editable={false}
                    width="200px"
                />
                <Column
                    field="background"
                    title="Background"
                    editable={false}
                    sortable={false}
                    // filterable={false}
                    width="200px"
                />
                <Column
                    field="latitude"
                    title="Latitude"
                    sortable={false}
                    editable={false}
                    filter="numeric"
                    width="160px"
                />
                <Column
                    field="longitude"
                    title="Longitude"
                    sortable={false}
                    editable={false}
                    filter="numeric"
                    width="160px"
                />
                <Column field="id" title="ID" width="230px" />
            </Grid>
        );

        const dialog = this.state.docInEdit && (
            <Dialog
                title={this.dialogTitle()}
                close={this.cancel}
                ok={this.save}
                cancel={this.cancel}
            >
                <form className="row k-form" onSubmit={this.handleSubmit}>
                    <div style={{ marginBottom: '1rem' }} className="col-md-6">
                        <label>
                            Name<br />
                            <Input
                                className="form-control"
                                type="text"
                                name="name"
                                value={this.state.docInEdit.name || ''}
                                onChange={this.onDialogInputChange}
                            />
                        </label>
                    </div>

                    <div style={{ marginBottom: '1rem' }} className="col-md-6">
                        <label>
                            categories<br />
                            <Input
                                className="form-control"
                                type="text"
                                name="categories"
                                value={
                                    this.state.docInEdit.categories || ''
                                }
                                onChange={this.onDialogInputChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '1rem' }} className="col-md-6">
                        <label>
                            Description<br />
                            <Input
                                className="form-control"
                                type="text"
                                name="description"
                                value={
                                    this.state.docInEdit.description || ''
                                }
                                onChange={this.onDialogInputChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '1rem' }} className="col-md-6">
                        <label>
                            phoneNumbers<br />
                            <Input
                                className="form-control"
                                type="text"
                                name="phoneNumbers"
                                value={
                                    this.state.docInEdit.phoneNumbers || ''
                                }
                                onChange={this.onDialogInputChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '1rem' }} className="col-md-6">
                        <label>
                            mobile<br />
                            <Input
                                className="form-control"
                                type="text"
                                name="mobile"
                                value={this.state.docInEdit.mobile || ''}
                                onChange={this.onDialogInputChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '1rem' }} className="col-md-6">
                        <label>
                            background<br />
                            <Input
                                className="form-control"
                                type="text"
                                name="background"
                                value={
                                    this.state.docInEdit.background || ''
                                }
                                onChange={this.onDialogInputChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '1rem' }} className="col-md-6">
                        <label>
                            latitude<br />
                            <Input
                                className="form-control"
                                type="text"
                                name="latitude"
                                value={this.state.docInEdit.latitude || ''}
                                onChange={this.onDialogInputChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '1rem' }} className="col-md-6">
                        <label>
                            longitude<br />
                            <Input
                                className="form-control"
                                type="text"
                                name="longitude"
                                value={this.state.docInEdit.longitude || ''}
                                onChange={this.onDialogInputChange}
                            />
                        </label>
                    </div>
                    <div
                        className="col-md-6"
                        className="k-form-field"
                        style={{ marginBottom: '1rem' }}
                    >
                        <input
                            id="ch1"
                            className="k-checkbox form-control"
                            type="checkbox"
                            name="isConfirmed"
                            checked={this.state.docInEdit.isConfirmed || ''}
                            onChange={this.onDialogInputChange}
                        />
                        <label className="k-checkbox-label" htmlFor="ch1">
                            IsConfirmed<br />
                        </label>
                    </div>
                </form>
            </Dialog>
        );

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
                            this.updateOwnerState('type', e.target.value);
                        }}
                    />
                    <label
                        style={{
                            margin: '7px 3em 7px 0px',
                            lineHeight: '1.2'
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
                            this.updateOwnerState('type', e.target.value);
                        }}
                    />
                    <label
                        style={{
                            margin: '7px 3em 7px 0px',
                            lineHeight: '1.2'
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
                            this.updateOwnerState('type', e.target.value);
                        }}
                    />
                    <label
                        style={{
                            margin: '7px 3em 7px 0px',
                            lineHeight: '1.2'
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
                            lineHeight: '1.2',
                            marginBottom: '1em'
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
                        style={{ lineHeight: '1.2' }}
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
                            this.updatePagerState('type', e.target.value);
                        }}
                    />
                    <label
                        style={{
                            margin: '7px 3em 7px 0px',
                            lineHeight: '1.2'
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
                            this.updatePagerState('type', e.target.value);
                        }}
                    />
                    <label
                        style={{
                            margin: '7px 3em 7px 0px',
                            lineHeight: '1.2'
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
                                this.updatePagerState('info', e.target.checked);
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
                                    'pageSizes',
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
                                    'previousNext',
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
                                'buttonCount',
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
                style={{ padding: '0px', marginBottom: '5px' }}
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
            <Col md="12" style={{ padding: '0px', marginBottom: '5px' }}>
                <Fade timeout={this.state.timeout} in={this.state.fadeIn}>
                    {card}
                </Fade>
            </Col>
        );

        return (
            <div>
                {columnCard}
                {grid}
                <Row>
                    <Col
                        md="12"
                        style={{ padding: '0px', marginBottom: '5px' }}
                    >
                        {dialog}
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Provider;
// ReactDOM.render(
//     <App />,
//     document.querySelector('my-app')
// );
