var calc_downsampled_matrix = require('../matrix/calc_downsampled_matrix');

module.exports = function calc_downsampled_layers(params){

  console.log('calculating downsampling layers')

  if (params.viz.rect_height < 1){

    // increase ds opacity, as more rows are compressed into a single downsampled
    // row, increase the opacity of the downsampled row. Max increase will be 2x
    // when 100 or more rows are compressed
    params.viz.ds_opacity_scale = d3.scale.linear().domain([1,100]).range([1,4])
      .clamp(true);

    var ds;

    // height of downsampled rectangles
    var inst_height = 3;

    // amount of zooming that is tolerated for the downsampled rows
    var inst_zt = 2;
    params.viz.ds_zt = inst_zt;

    // the number of downsampled matrices that need to be calculated
    // var num_layers = Math.round(inst_height / (params.viz.rect_height * inst_zt));

    var total_zoom = inst_height / params.viz.rect_height;

    var num_layers = Math.floor( Math.log(total_zoom)/Math.log(inst_zt) ) ;

    params.viz.ds_num_layers = num_layers;

    // array of downsampled parameters
    params.viz.ds = [];

    // array of downsampled matrices at varying layers
    params.matrix.ds_matrix = [];

    var inst_order = params.viz.inst_order.row;

    // calculate parameters for different layers
    for (var i=0; i < num_layers; i++){

      // instantaneous ds_level (-1 means no downsampling)
      params.viz.ds_level = 0;

      ds = {};

      ds.height = inst_height;
      ds.num_layers = num_layers;

      var inst_zoom_tolerance = Math.pow(inst_zt, i);

      ds.zt = inst_zoom_tolerance;

      // the number of downsampled rows is given by the height of the clustergram
      // divided by the adjusted height of the downsampled rect.
      // the adjusted height is the height divided by the zooming tolerance of
      // the downsampled layer

      // number of downsampled rows
      ds.num_rows = Math.round(
          params.viz.clust.dim.height / ( ds.height / inst_zoom_tolerance )
        );

      // x_scale
      /////////////////////////
      ds.x_scale = d3.scale.ordinal()
        .rangeBands([0, params.viz.clust.dim.width]);

      ds.x_scale
        .domain( params.matrix.orders[inst_order + '_row' ] );

      // y_scale
      /////////////////////////
      ds.y_scale = d3.scale.ordinal()
        .rangeBands([0, params.viz.clust.dim.height]);
      ds.y_scale
        .domain( d3.range(ds.num_rows + 1) );

      ds.rect_height = ds.y_scale.rangeBand() -
        params.viz.border_width.y;

      params.viz.ds.push(ds);

      var matrix = calc_downsampled_matrix(params, i);
      params.matrix.ds_matrix.push(matrix);

    }

    // reset row viz_nodes since downsampling
    params.viz.viz_nodes.row = d3.range(params.matrix.ds_matrix[0].length).map(String);
  } else {
    // set ds to null if no downsampling is done
    params.viz.ds = null;
    // instantaneous ds_level (-1 means no downsampling)
    params.viz.ds_level = -1;
    params.viz.ds_num_layers = 0;
  }

};