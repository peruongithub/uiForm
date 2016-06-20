$.fn.uiInputSelect_watch = function (props, func, interval, id) {
    /// <summary>
    /// Allows you to monitor changes in a specific
    /// CSS property of an element by polling the value.
    /// when the value changes a function is called.
    /// The function called is called in the context
    /// of the selected element (ie. this)
    /// </summary>
    /// <param name="prop" type="String">CSS Properties to watch sep. by commas</param>
    /// <param name="func" type="Function">
    /// Function called when the value has changed.
    /// </param>
    /// <param name="interval" type="Number">
    /// Optional interval for browsers that don't support DOMAttrModified or propertychange events.
    /// Determines the interval used for setInterval calls.
    /// </param>
    /// <param name="id" type="String">A unique ID that identifies this watch instance on this element</param>
    /// <returns type="jQuery" />
    if (!interval)
        interval = 400;
    if (!id)
        id = "_watcher";

    return this.each(function () {
        var _t = this;
        var el$ = $(this);
        var fnc = function () {
            __watcher.call(_t, id)
        };

        var data = {
            id: id,
            props: props.split(","),
            values: [props.split(",").length],
            func: func,
            fnc: fnc,
            origProps: props,
            interval: interval,
            intervalId: null
        };
        // store initial props and values
        $.each(data.props, function (i) {
            data.values[i] = el$.css(data.props[i]);
        });

        el$.data(id, data);

        hookChange(el$, id, data);
    });

    function hookChange(el$, id, data) {
        el$.each(function () {
            var el = $(this);
            data.intervalId = setInterval(data.fnc, interval);
        });
    }

    function __watcher(id) {
        var el$ = $(this);
        var w = el$.data(id);
        if (!w) return;
        var _t = this;

        if (!w.func)
            return;

        // must unbind or else unwanted recursion may occur
        el$.uiInputSelect_unwatch(id);

        var changed = false;
        var i = 0;
        for (i; i < w.props.length; i++) {
            var newVal = el$.css(w.props[i]);
            if (w.values[i] != newVal) {
                w.values[i] = newVal;
                changed = true;
                break;
            }
        }

        if (changed){
            w.func.call(_t, w, i);
        }

        // rebind event
        hookChange(el$, id, w);
    }
};

$.fn.uiInputSelect_unwatch = function (id) {
    this.each(function () {
        var el = $(this);
        var data = el.data(id);
        try {
            clearInterval(data.intervalId);
        }
            // ignore if element was already unbound
        catch (e) {
        }
    });
    return this;
};

$.fn.uiForm = function () {


    $(this).each(function (i) {

        if($(this).data('custom')){
            return true;
        }
        var input = $(this);

        if ($(this).is('fieldset')){
            input.data('custom', true);

            $(this).addClass('ui-corner-all ui-widget-content');
            $('legend', $(this)).addClass('ui-corner-all ui-state-default').css('padding',function () {
                $(this).parent().append('<span id="__min_w" >0</span>');
                min_h = $('span#__min_w', $(this).parent()).height();
                $('span#__min_w', $(this).parent()).remove();
                return (min_h/6).toFixed() + 'px';
            });
        }
        else if(($(this).is('input') || $(this).is('textarea'))) {
            input.data('custom', true);



            if ($(this).is('[type=checkbox],[type=radio]')) {
                $(this).data('custom', true);

                var ico = 'ui-icon-bullet';//ui-icon-radio-off
                var ico_2 = 'ui-icon-radio-on';
                if ($(input).is('[type=checkbox]')) {
                    ico = 'ui-icon-check';
                    ico_2 = '';
                }
                var cl_s = 'ui-state-default ui-corner-all';

                input.wrap('<div class="custom_checkbox ' + cl_s + '"></div>');
                input.parent().prepend('<span class="c_c_i ui-icon ' + ico + '"/>');

                var input_wraper = input.parent();
                var span_icon = $('span.c_c_i', input_wraper);

                if ($(input).is('[type=checkbox]')) {
                    span_icon.data('icon', {'ico': ico, 'ico_2': span_icon.css('background-position')});
                } else {
                    span_icon.data('icon', {'ico': ico, 'ico_2': ico_2});
                }
                if (!$(input).is(':checked')) {
                    if ($(input).is('[type=checkbox]')) {
                        $('span.c_c_i', input.parent()).css({'background-position': '-240px 0px'});
                    }
                    else {
                        $('span.c_c_i', input.parent()).removeClass('' + ico + '').addClass('' + ico_2 + '');
                    }
                }

                input
                    .css({
                        'opacity': 0,
                        'filter': 'Alpha(Opacity=0)',
                        'padding': '0px',
                        'border-width': '0px',
                        'margin': '0px',
                        'z-index': '99'
                    })
                    .css({
                        'margin-left': '-' + ((input.width() ? input.width() : 14) / 2) + 'px',
                        'margin-top': '-' + ((input.height() ? input.height() : 14) / 2) + 'px',
                        //'border-width':((span_icon_w-(input.width()))/2)+'px',
                        'position': 'absolute',
                        'top': '50%',
                        'left': '50%'
                    })
                    .change(function (event) {//alert(1342);
                        var parent = $(this).parent();
                        var typeRadio = $(this).is('[type=radio]');
                        var typeCheckbox = $(this).is('[type=checkbox]');
                        if ($(this).is(':disabled')) {
                            //$(this).removeAttr('disabled');
                            parent.addClass('ui-state-disabled');
                        } else {
                            parent.removeClass('ui-state-disabled');
                        }
                        var spanuiicon = $('span.c_c_i', parent);
                        var ico = spanuiicon.data('icon').ico;
                        var ico_2 = spanuiicon.data('icon').ico_2;
                        if (typeRadio) {
                            var spanuiicon_not_this = $('span.c_c_i', $('input:radio[name="' + $(this).attr('name') + '"]', $(document)).parent());
                        }
                        if ($(this).is(':checked')) {
                            if (typeCheckbox) {
                                spanuiicon.css({'background-position': ico_2});
                            }
                            else if (typeRadio) {
                                spanuiicon_not_this.removeClass('' + ico + '').removeClass('' + ico_2 + '').addClass('' + ico_2 + '');
                                spanuiicon.addClass('' + ico + '').removeClass('' + ico_2 + '');
                            }
                        }
                        else {
                            if (typeCheckbox) {
                                spanuiicon.css({'background-position': '-240px 0px'});
                            }
                            else if (typeRadio) {
                                spanuiicon_not_this.removeClass('' + ico + '').removeClass('' + ico_2 + '').addClass('' + ico_2 + '');
                                spanuiicon.removeClass('' + ico + '').addClass('' + ico_2 + '');
                            }
                        }
                    })
                    .hover(
                        function () {
                            $(this).parent().addClass('ui-state-hover');
                        }, function () {
                            $(this).parent().removeClass('ui-state-hover');
                        }
                    );
                input_wraper.css({
                    'position': 'relative',
                    'vertical-align': 'middle',
                    'display': 'inline-block'
                });
            }

            if ($(this).is('[type=text],[type=password],textarea')) {
                $(this).data('custom', true);

                if ($(this).css('display') !== 'none') {

                    input
                        .attr('style', 'background:none; background-color:#FFFFFF; padding:4px;')
                        .addClass('ui-state-default ui-corner-all')
                        .hover(
                            function () {
                                $(this).addClass('ui-state-hover');
                            },
                            function () {
                                $(this).removeClass('ui-state-hover');
                            }
                        );
                }
            }

            if ($(this).is('[type=file]')) {
                var button_text = "Обзор...";
                var input_button_text = "<nobr><i>Выбрать файл</i></nobr>";
                input
                    .css({
                        'opacity': 0,
                        'filter': 'Alpha(Opacity=0)',
                        'padding': '0px',
                        'border-width': '0px',
                        'margin': '0px',
                        'position': 'absolute',
                        'top': '0px',
                        'left': '0px',
                        'height': '100%'
                    })
                    .wrap('<div class="custom_file_input" style="position:relative;display:inline-block;vertical-align:middle;"></div>')
                    .parent()
                    .prepend('<table cellpadding="0" cellspacing="0" border="0" class="file_input_button"><tr><td><div class="file_input_input ui-state-default ui-corner-left" style="background:none; background-color:#FFFFFF; padding:4px;">' + input_button_text + '</div></td><td style="width:30px;"><div class="file_input_button_button ui-state-default ui-corner-right" style="padding:4px;margin-left:-1px;">' + button_text + '</div></td></tr></table>');

                var parent = input.parent();
                var file_input_button = $('table.file_input_button', parent);
                var i_w = input.width();
                var file_input_button_button = $('div.file_input_button_button', file_input_button);
                var file_input_input = $('div.file_input_input', file_input_button);

                file_input_button
                    .css({
                        'width': (i_w) + 'px'
                    });
                input
                //.height(file_input_button.height())
                    .hover(function () {
                        $('div', file_input_button).addClass('ui-state-hover');
                    }, function () {
                        $('div', file_input_button).removeClass('ui-state-hover');
                    })
                    .change(function () {//alert($(this).val());
                        var file_name = input_button_text;
                        if ($(this).val()) {
                            file_name = '<nobr>' + $(this).val() + '</nobr>';
                        }
                        file_input_input.html(file_name);
                    });
                if (input.is(':hidden')) {
                    input.uiInputSelect_watch('width', function (event) {
                        file_input_button
                            .css({
                                'width': ($(this).width()) + 'px'
                            });
                        $(this).height(file_input_button.height());

                        $(this).uiInputSelect_unwatch();
                    });
                }

            }



            if ($(this).is('[type=button]') || $(this).is('[type=reset]') || $(this).is('[type=submit]')) {
                var id = 'input_button_'+i;
                input
                    .data('custom', true)
                    .prop('id','input_button_'+i)
                    .css({
                        'opacity': 0,
                        'outline': 0,
                        'filter': 'Alpha(Opacity=0)',
                        'padding': '0px',
                        'border-width': '0px',
                        'margin': '0px',
                        'position': 'absolute',
                        'top': '0px',
                        'left': '0px',
                        'height': '0px',
                        'width':'0px'
                    })
                    //.button();
                    .parent()
                    .prepend('<span id="'+id+'" class="ui-button ui-widget ui-state-default ui-corner-all"><span id="text">'+input.val()+'</span></span>');
                var button = input.parent().find('span#'+id);
                button
                    .hover(
                        function () {
                            $(this).addClass('ui-state-hover');
                        },
                        function () {
                            $(this).removeClass('ui-state-hover');
                        }
                    )
                    .css('padding',function () {
                        $(this).parent().append('<span id="__min_w" >0</span>');
                        min_h = $('span#__min_w', $(this).parent()).height();
                        $('span#__min_w', $(this).parent()).remove();
                        return (min_h/4).toFixed() + 'px';
                    });

                if(input.is('[type=submit]')){
                    button
                        .addClass('ui-button-text-icon-primary')
                        //.click(function () {
                        //$(this).parents('form')[0].submit();
                        //})
                        .prepend('<span class="ui-button-icon-primary ui-icon ui-icon-disk"></span>')
                        .find('span#text')
                        .addClass('ui-button-text')
                        .css({
                            'padding':function () {
                                return '0px 0px 0px '+(
                                            $('span.ui-button-icon-primary', $(this).parent()).width()
                                            +
                                            parseFloat($(this).parent().css('padding-left'))
                                        ).toFixed()
                                        + 'px';
                            }
                        })
                    ;
                }else if(input.is('[type=reset]')){
                    //button.click(function () {
                    //    $(this).parents('form')[0].reset();
                    //});
                }else{

                }
                button.click(function () {
                    $('input#'+$(this).prop('id'),$(this).parent()).trigger('click');
                });
            }
        }
        else if ($(this).is('select') && $(this).is('[size]')) {
            $(this).data('custom', true);
            input
                .css({
                    //'opacity': 0,
                    //'filter': 'Alpha(Opacity=0)',
                    'height': '100%',
                    'padding': '0px',
                    'border-width': '0px  !important',
                    'margin': '0px  !important',
                    'width': function () {
                        var input_w = (($(this).width() || $(this).clientWidth) || 'auto');
                        if (input_w == 'auto') {
                            return input_w;
                        } else {
                            return (input_w);
                        }
                    },
                    'z-index': '99'
                })
                .wrap('<div></div>')
                .parent()
                .prepend('<div id="customSelect_item" ></div>')
                .css({
                    'position': 'relative',
                    //'width': (input.width()||'100%')
                })
                .wrap('<div></div>')
                .parent()
                .attr('style', 'padding:4px;')
                .addClass('ui-widget ui-state-default ui-corner-all')
                .hover(
                    function () {
                        $(this).addClass('ui-state-hover');
                    },
                    function () {
                        $(this).removeClass('ui-state-hover');
                    }
                )
                .wrap('<div id="customSelect_wraper"></div>')
                .parent()
                .css({
                    'vertical-align': 'middle',
                    //'display': '-moz-inline-stack',
                    'display': 'inline-block',
                    //'zoom': '1',
                    //'*display':'inline'
                });




        }
        else if ($(this).is('select') && !$(this).is('[size]')) {
            $(this).data('custom', true);
            input
                .css({
                    'opacity': 0,
                    'filter': 'Alpha(Opacity=0)',
                    'height': '100%',
                    'padding': '0px  !important',
                    'border-width': '0px  !important',
                    'margin': '0px  !important',
                    'width': function () {
                        var input_w = (($(this).width() || $(this).clientWidth) || 'auto');
                        if (input_w == 'auto') {
                            return input_w;
                        } else {
                            return (input_w);
                        }
                    },
                    'z-index': '99'
                })
                .wrap('<div></div>')
                .parent()
                .prepend('<div id="customSelect_item" ></div>')
                .css({
                    'position': 'relative',
                    //'width': (input.width()||'100%')
                });
            /*if (!$.browser.mozilla){
             input.find('option')
             .addClass('ui-widget-content')
             .hover(function(){$(this).addClass('ui-state-hover');},function(){$(this).removeClass('ui-state-hover');})
             .end();
             }*/
            var input_w = ((input.width() || input.clientWidth) || 'auto');

            input
                .parent()
                .find('div#customSelect_item')
                .button({icons: {secondary: "ui-icon-carat-2-n-s"}})
                .css({
                    'width': function () {
                        if ((input.css('width')) && (input_w !== 'auto')) {
                            return (parseFloat(input.css('width')) - ((parseFloat($(this).css('border-left-width')) + parseFloat($(this).css('border-right-width'))))) + 'px';
                        } else {
                            return (input_w - (parseFloat($(this).css('border-left-width')) + parseFloat($(this).css('border-right-width')))) + 'px';
                        }
                    }
                })
                .end()
                .wrap('<div id="customSelect_wraper"></div>')
                .parent()
                .css({
                    'vertical-align': 'middle',
                    //'display': '-moz-inline-stack',
                    'display': 'inline-block',
                    //'zoom': '1',
                    //'*display':'inline'
                });

            if (input.is(':disabled')) {
                $('div#customSelect_item', input.parent()).button({disabled: true});
            }

            $('div#customSelect_item span.ui-button-text', input.parent())
                .css({
                    'padding-bottom': '3px',
                    'padding-top': '3px',
                    'padding-left': '3px',
                    'padding-right': function () {
                        $('span.ui-icon', $(this).parent()).css('right', '3px');

                        return (parseFloat($('span.ui-icon', $(this).parent()).css('width')) + parseFloat($('span.ui-icon', $(this).parent()).css('right')) + 3) + 'px';
                    }
                })
                .append('<span style="display:block;overflow:hidden;text-align:left;"></span>');

            $('option', input).each(function (index, element) {
                var option = $(this);
                if (option.val() == input.val()) {
                    var div_text = option.val();

                    if (option.text().length > 0) {
                        div_text = option.text();
                    }

                    $('div#customSelect_item span.ui-button-text span', input.parent()).html(
                        '<nobr>' + div_text + '</nobr>'
                    );
                    //$(this).attr('selected','selected');
                } else if (option.text() == input.val()) {
                    $('div#customSelect_item span.ui-button-text span', input.parent()).html(
                        '<nobr>' + option.text() + '</nobr>'
                    );
                } else {
                    //$(this).removeAttr('selected');
                }
            });

            function __min_w(el) {
                el.append('<span id="__min_w" >0000</span>');
                min_w = $('span#__min_w', el).width();
                $('span#__min_w', el).remove();
                return min_w;
            }

            input
                .parent()
                .find('div#customSelect_item')
                .css({
                    'width': function () {
                        var this_borders = parseFloat($(this).css('border-left-width')) + parseFloat($(this).css('border-right-width'));
                        var minWidth = __min_w($('span.ui-button-text', $(this)));
                        if ($('span.ui-button-text span', $(this)).width() < minWidth) {
                            var this_width = $(this).width();
                            var this_text_width = $('span.ui-button-text span', $(this)).width();
                            var out = this_width + (minWidth - this_text_width);
                            input.css({'width': (out + this_borders) + 'px'});
                            return out;
                        }
                    }
                });
            input
                .css({
                    'position': 'absolute',
                    'left': 0,
                    'top': 0
                })
                .change(function (event) {

                    var sel = $(this);
                    if (sel.is(':disabled')) {
                        $('div#customSelect_item', $(this).parent()).button({disabled: true});
                    } else {
                        $('div#customSelect_item', $(this).parent()).button({disabled: false});
                    }
                    $('option', $(this)).each(function (index, element) {
                        var option = $(this);
                        if (option.val() == sel.val()) {
                            var div_text = option.val();
                            if (option.text().length > 0) {
                                div_text = option.text();
                            }
                            $('div#customSelect_item span.ui-button-text span', sel.parent()).html(
                                '<nobr>' + div_text + '</nobr>'
                            );
                            //$(this).attr('selected','selected');
                        } else if (option.text() == sel.val()) {
                            $('div#customSelect_item span.ui-button-text span', sel.parent()).html(
                                '<nobr>' + option.text() + '</nobr>'
                            );
                        } else {
                            //$(this).removeAttr('selected');
                        }
                    });
                    /*	$('div#customSelect_item span.ui-button-text span',$(this).parent()).html( function() {
                     if($('option[selected=selected]',sel).text().length){
                     return '<nobr>'+$('option[selected=selected]',sel).text()+'</nobr>';
                     }else{
                     return '<nobr>'+sel.val()+'</nobr>';
                     }
                     }); */
                })
                .hover(
                    function () {
                        $('div#customSelect_item', $(this).parent()).mouseover();
                    },
                    function () {
                        $('div#customSelect_item', $(this).parent()).mouseout();
                    }
                );
            //.attr('onchange'," var sel=$(this);$('option',$(this)).each(function(index, element) {if($(this).val() == sel.val()){$(this).attr('selected','selected');}else{$(this).removeAttr('selected');}  }); $('div#customSelect_item span.ui-button-text span',$(this).parent()).html( function() { if($('option[selected=selected]',sel).text().length){return '<nobr>'+$('option[selected=selected]',sel).text()+'</nobr>';}else{return '<nobr>'+sel.val()+'</nobr>';}  }); "+(input.attr('onchange')?input.attr('onchange'):'')+" ")
            //.attr('onmouseover',"	$('div#customSelect_item',$(this).parent()).mouseover();")
            //.attr('onmouseout',"	$('div#customSelect_item',$(this).parent()).mouseout();")
            if (input.is(':hidden')) {
                input.uiInputSelect_watch('width', function (event) {//alert($(this).width());
                    if ($(this).width() !== ($('div#customSelect_item', $(this).parent()).width() + ((parseFloat($('div#customSelect_item', $(this).parent()).css('border-left-width')) + parseFloat($('div#customSelect_item', $(this).parent()).css('border-right-width')))))) {

                        $(this)
                        //.watch('width,height', function(){},0)
                            .parent()
                            .find('div#customSelect_item')
                            .css({
                                'width': function () {
                                    var this_borders = parseFloat($(this).css('border-left-width')) + parseFloat($(this).css('border-right-width'));
                                    var minWidth = __min_w($('span.ui-button-text', $(this)));
                                    if ($('span.ui-button-text span', $(this)).width() < minWidth) {
                                        var this_width = $(this).width();
                                        var this_text_width = $('span.ui-button-text span', $(this)).width();
                                        var out = this_width + (minWidth - this_text_width);
                                        $('select', $(this).parent()).css({'width': (out + this_borders) + 'px'});
                                        return out;
                                    } else if ($('span.ui-button-text span', $(this)).width() > minWidth) {
                                        return ($('select', $(this).parent()).width() - this_borders) + 'px';
                                    }
                                }
                            });
                        $(this).uiInputSelect_unwatch();
                    }
                });
            }


        }

    });

    return $(this);
};

