import React from 'react';

export default class Dialog extends React.Component {
  render() {
    return (<div className="k-dialog-wrapper"><div className="k-overlay" />
      <div className="col-md-10 k-widget k-window k-dialog">
        <div className="k-window-titlebar k-dialog-titlebar k-header">
          <div className="k-window-title k-dialog-title">{this.props.title}</div>
          <div className="k-window-actions k-dialog-actions">
            <a aria-label="Close" className="k-button k-bare k-button-icon k-window-action k-dialog-action k-dialog-close"
              onClick={() => this.props.close()} role="button" >
              <span className="k-icon k-i-x" />
            </a>
          </div>
        </div>
        <div className="k-content k-window-content k-dialog-content" style={{ overflowX: 'hidden' }}>
          {this.props.children}
        </div>
        <div className="k-button-group k-dialog-buttongroup k-dialog-button-layout-stretched">
          <button className="k-button" onClick={() => this.props.cancel()} >Cancel</button>
          <button className="k-button k-primary" onClick={() => this.props.ok()} >Save</button>
        </div>
      </div>
    </div>);
  }
}
