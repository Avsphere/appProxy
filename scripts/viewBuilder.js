const FORM_CONFIG = {
  id : 'appForm',
  colConfig : [
    {
      type : 'internalUrl',
      placeHolder : 'Internal Url'
    },
    {
      type : 'externalUrl',
      placeHolder : 'External Url'
    },
    {
      type : 'name',
      placeHolder : 'Name'
    },
    {
      type : 'spn',
      placeHolder : 'SPN'
    }
  ]
}


class ViewBuilder {
  constructor() {
    this.wiaAppCount = 0;
    this.formAppCount = 0;
  }


  buildFormRow( type ) {
    let that = this;
    function buildRowTitle() {
      if  ( type === 'wiaApp' ) {
        that.wiaAppCount++;
        return 'Windows Application #' + that.wiaAppCount;
      } else if ( type === 'formApp' ) {
        that.formAppCount++;
        return 'Form Application #' + that.formAppCount;
      } else {
        throw new Error('row type unknown' + type)
      }
    }
    function buildFormCol( type, placeHolder ) {
      placeHolder = placeHolder ? placeHolder : '';
      let html = `
      <div class="col">
        <input type="text" class="form-control" autocomplete="off" data-type==${type} placeholder="${placeHolder}">
      </div>`;
      return html;
    }
    function buildTitleCol() {
      let html = `
      <div class="col">
        <h5 style="font-weight:400; float:right; white-space:nowrap;"> ${buildRowTitle() } </h5>
      </div>`;
      return html;
    }

    let html = '<div class="form-row">';
    html += buildTitleCol();
    FORM_CONFIG.colConfig.forEach( (col) => {
      html += buildFormCol( col.type , col.placeHolder );
    })
    html += '</div>';

    return html;
  }
  buildForm() {
    let html = `
    <form autocomplete="off" id="appForm">
    </form>`;
    return html;
  }

  handles() {
    $('#addWiaApp').on('click', (el) => {
      $('#' + FORM_CONFIG.id ).append( this.buildFormRow( 'wiaApp' ) );
    })

    $('#addFormApp').on('click', (el) => {
      $('#' + FORM_CONFIG.id ).append( this.buildFormRow( 'formApp') );
    })
  }

  init() {
    $('#formContainer').html( this.buildForm() );
    this.handles();
  }



}
