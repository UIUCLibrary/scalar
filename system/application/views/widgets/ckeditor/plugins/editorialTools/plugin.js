CKEDITOR.plugins.add( 'editorialTools', {
    //icons: 'editorialTools',
    init: function( editor ) {
        base = this;
        base.$editorialToolsPanel;
        base.addedEditorialToolsPanel = false;
        base.expandedEditorWidth = 0;
        base.editorialState = $('header span.metadata[property="scalar:editorialState"]').text();

        base.is_author = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Author';
        base.is_commentator = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Commentator';
        base.is_reviewer = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Reviewer';
        base.is_editor = $('link#user_level').length > 0 && $('link#user_level').attr('href')=='scalar:Editor';

        base.waitingForReview = false;

        base.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        base.hideVersions = function(){
            base.$versionListBody.find('.selected').removeClass('selected').find('.current').addClass('selected');

            $('#title').show();
            $('#page_description').show();
            $('#title_placeholder').hide();
            $('#description_placeholder').hide();

            base.restoreEditor();
        };
        base.serializeQueries = function(){
            var queryJSON = {"queries":[]};
            base.$queries.children('.query').each(function(){
                var query = $(this).data('query');
                //Remove the replies - we'll build those again
                delete query.replyTo;
                query.replies = [];
                //Now add the replies...
                $(this).find('.replies .query').each(function(){
                    var reply = $(this).data('query');
                    delete reply.replyTo;
                    delete reply.id;
                    //These shouldn't have replies, but just in case...
                    delete reply.replies;
                    query.replies.push(reply);
                });
                queryJSON.queries.push(query);
            });
            base.$resolvedQueries.find('#resolvedQueries').children('.query').each(function(){
                var query = $(this).data('query');
                //Remove the replies - we'll build those again
                query.replies = [];
                delete query.replyTo;
                query.resolved = true;
                //Now add the replies...
                $(this).find('.replies .query').each(function(){
                    var reply = $(this).data('query');
                    delete reply.replyTo;
                    delete reply.id;
                    delete reply.resolved;
                    //These shouldn't have replies, but just in case...
                    delete reply.replies;
                    query.replies.push(reply);
                });
                queryJSON.queries.push(query);
            });
            queryJSON.queries.sort(function(a,b){
                return a.id - b.id;
            });
            $('#editorial_queries').val(JSON.stringify(queryJSON));
            $('#unsavedQueryWarning').show().attr('aria-hidden','false');
        };
        base.addQuery = function(query,scrollToQuery){
            var date = query.date;
            if(typeof date === "string"){
                date = new Date(date);
            }
            var hour = date.getHours();
            var suffix = "am";
            if(hour > 12){
                hour -= 12;
                suffix = "pm";
            }else if(hour == 0){
                hour = 12;
            }
            var dateString = hour+':'+date.getMinutes()+' '+suffix+' '+base.monthNames[date.getMonth()]+' '+date.getDate();
            var $query = $('<div class="query" id="query_'+query.id+'">'+
                                (!query.resolved?'<button class="btn btn-sm pull-right resolve">Resolve</button>':'')+
                                '<strong class="user">'+query.user+'</strong>'+
                                '<small class="date">'+dateString+'</small>'+
                                '<div class="body">'+query.body+'</div>'+
                           '</div>');
            $query.data('query',query);
            $query.find('.resolve').click(function(){
                base.$resolvedQueries.show();
                var $query = $(this).parents('.query');
                $query.appendTo(base.$resolvedQueries.find('#resolvedQueries'));
                $(this).remove();
                $query.find('.newReply').remove();
                var query = $query.data('query');
                query.resolved = true;
                $query.data('query',query);
                base.$resolvedQueries.find('.queryCount').text(parseInt(base.$resolvedQueries.find('.queryCount').text())+1);
                base.serializeQueries();
            });
            var $replies = $('<div class="replies"></div>').appendTo($query);
            if(!query.resolved){
                var $newReply = $('<div class="newReply">'+
                                        '<form class="form-inline">'+
                                            '<div class="form-group">'+
                                                '<label class="sr-only" for="reply_'+query.id+'">New reply</label>'+
                                                '<input type="text" class="form-control input-sm replyText" id="reply_'+query.id+'" placeholder="New reply">'+
                                                '<button type="submit" class="btn btn-default btn-sm pull-right">Add</button>'+
                                            '</div>'+
                                        '</form>'+
                                  '</div>').appendTo($query);
                $newReply.find('button').click(function(e){
                    e.preventDefault();
                    var $newReply = $(this).parents('.newReply');
                    var bodyText = $newReply.find('.replyText').focus().val();
                    if(bodyText==''){
                        return false;
                    }
                    var newReply = {
                        user : fullName,
                        date :  new Date(),
                        body : bodyText
                    };
                    $newReply.find('input').val('');
                    date = newReply.date;
                    hour = date.getHours();
                    suffix = "am";
                    if(hour > 12){
                        hour -= 12;
                        suffix = "pm";
                    }else if(hour == 0){
                        hour = 12;
                    }
                    dateString = hour+':'+date.getMinutes()+' '+suffix+' '+base.monthNames[date.getMonth()]+' '+date.getDate();
                    var $reply = $('<div class="query">'+
                                        '<strong class="user">'+newReply.user+'</strong>'+
                                        '<small class="date">'+dateString+'</small>'+
                                        '<div class="body">'+newReply.body+'</div>'+
                                   '</div>').appendTo($replies);
                    $reply.data('query',newReply);
                    base.$queriesPanel.animate({
                        scrollTop: $newReply.offset().top-base.$queriesPanel.offset().top
                    }, 0);
                    base.serializeQueries();
                });
            }
            for(var r in query.replies){
                var reply = query.replies[r];
                date = reply.date;
                if(typeof date === "string"){
                    date = new Date(date);
                }
                hour = date.getHours();
                suffix = "am";
                if(hour > 12){
                    hour -= 12;
                    suffix = "pm";
                }else if(hour == 0){
                    hour = 12;
                }
                dateString = hour+':'+date.getMinutes()+' '+suffix+' '+base.monthNames[date.getMonth()]+' '+date.getDate();
                var $reply = $('<div class="query" id="query_'+reply.id+'">'+
                                    '<strong class="user">'+reply.user+'</strong>'+
                                    '<small class="date">'+dateString+'</small>'+
                                    '<div class="body">'+reply.body+'</div>'+
                               '</div>').appendTo($replies);
                $reply.data('query',reply);
            }
            if(query.resolved){
                base.$resolvedQueries.show();
                base.$resolvedQueries.find('.queryCount').text(parseInt(base.$resolvedQueries.find('.queryCount').text())+1);
                $query.appendTo(base.$resolvedQueries.find('#resolvedQueries'));
                if(scrollToQuery && scrollToQuery === true){
                    base.$queriesPanel.animate({
                        scrollTop: $query.offset().top-base.$queriesPanel.offset().top
                    }, 200);
                }
            }else{
                $query.appendTo(base.$queries);
                if(scrollToQuery && scrollToQuery === true){
                    base.$queries.find('.new').removeClass('new');
                    $query.addClass('new');
                    base.$queriesPanel.animate({
                        scrollTop: $query.offset().top-base.$queriesPanel.offset().top
                    }, 200);
                    window.setTimeout(function(){
                        base.$queries.find('.new').removeClass('new');
                    },200);
                }
            }
        };
        base.enableSave = function(newHtml){

            var $placeholder = $('<div>'+newHtml+'</div>');


            $placeholder.find('.br_tag').each(function(){
                $(this).replaceWith('<br />');
            });

            $placeholder.find('.p_tag').each(function(){
                $(this).replaceWith('<p />');
            });

            $placeholder.find('span[data-diff="chunk"].accepted').each(function(){
                var $newChunk = $('<div>'+($(this).children('span[data-diff]').last().html())+'</div>');
                $newChunk.find('.hiddenVisual').removeClass('hiddenVisual');
                $(this).replaceWith($newChunk.html());
            });

            $placeholder.find('span[data-diff="chunk"].rejected').each(function(){
                var $newChunk = $('<div>'+($(this).children('span[data-diff]').first().html())+'</div>');
                $newChunk.find('.hiddenVisual').removeClass('hiddenVisual');
                $(this).replaceWith($newChunk.html());    
            });

            $(editor.container.$).find('iframe').show();
            editor.setData($placeholder.html());

            $('#title_placeholder').hide();
            $placeholder.html($('#title_placeholder').html());

            $placeholder.find('span[data-diff="chunk"].accepted').each(function(){
                var $newChunk = $('<div>'+($(this).children('span[data-diff]').last().html())+'</div>');
                $newChunk.find('.hiddenVisual').removeClass('hiddenVisual');
                $(this).replaceWith($newChunk.html());
            });

            $placeholder.find('span[data-diff="chunk"].rejected').each(function(){
                var $newChunk = $('<div>'+($(this).children('span[data-diff]').first().html())+'</div>');
                $newChunk.find('.hiddenVisual').removeClass('hiddenVisual');
                $(this).replaceWith($newChunk.html());
            });
            $('#title').val($placeholder.html()).show();

            $('#description_placeholder').hide();
            $placeholder.html($('#description_placeholder').html());
            $placeholder.find('span[data-diff="chunk"].accepted').each(function(){
                var $newChunk = $('<div>'+($(this).children('span[data-diff]').last().html())+'</div>');
                $newChunk.find('.hiddenVisual').removeClass('hiddenVisual');
                $(this).replaceWith($newChunk.html());    
            });
            
            $placeholder.find('span[data-diff="chunk"].rejected').each(function(){
                var $newChunk = $('<div>'+($(this).children('span[data-diff]').first().html())+'</div>');
                $newChunk.find('.hiddenVisual').removeClass('hiddenVisual');
                $(this).replaceWith($newChunk.html());
            });
            $('#page_description').val($placeholder.html()).show();


            $('.saveButtons .editingDisabled').removeClass('editingDisabled');

            $('body').on('savedPage',function(e){
                if($('body').hasClass('isReviewing')){
                    base.waitingForReview = false;
                    base.restoreEditor();
                    $('body').removeClass('isReviewing');
                }
            });
        };
        base.restoreEditor = function(newHTML){
            if(base.$diffEditor){
                base.$diffEditor.detach();
            }
            if(base.waitingForReview){
                base.$reviewEditor.show();
                return;
            }
            if(base.$reviewEditor){
                base.$reviewEditor.detach();
            }
            if(newHTML){
                editor.setData(newHTML);
            }
            editor.setReadOnly(false);

            $(editor.container.$).find('iframe').show();

            $('.editingDisabled').removeClass('editingDisabled');
        }
        base.disableEditor = function(reviewMode){
            editor.setReadOnly(true);
            $(editor.container.$).find('iframe').hide();
            $('#editor-tabpanel,input[value="Save"],input[value="Save and view"],.statusGroup,.usageGroup,.saveAndMove').addClass('editingDisabled');
            if(!base.$reviewEditor){
                base.$reviewEditor = $('<div id="editorialReviewEditor"></div>').appendTo($(editor.container.$).find('.cke_contents'));
                base.$diffEditor = $('<div id="editorialDiffEditor"></div>').appendTo($(editor.container.$).find('.cke_contents'));

                $('<div id="title_placeholder" class="form-control placeholderField"></div>').insertAfter('#title');
                $('<div id="description_placeholder" class="form-control placeholderField"></div>').insertAfter('#page_description');

            }else{
                base.$diffEditor.html('').appendTo($(editor.container.$).find('.cke_contents'));
            }
            if(reviewMode){
                base.$diffEditor.hide();
                base.$reviewEditor.show();
                $('body').addClass('isReviewing');
            }else{
                $('body').removeClass('isReviewing');
                base.$reviewEditor.hide();
                base.$diffEditor.show();
            }

            $('#title').hide();
            $('#page_description').hide();


            $('#title_placeholder').show();
            $('#description_placeholder').show();
        }
        base.createInteractiveDiff = function(diff,reviewMode){
            var $viewport = reviewMode?base.$reviewEditor:base.$diffEditor;var titleText = '';
            $('#title_placeholder').html(diff.title);
            $('#description_placeholder').html(diff.description);
            $viewport.html(diff.body);

            if(reviewMode){
                $viewport.find('a').click(function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    $(this).parents('span[data-diff="chunk"]').tooltip('show');
                    return false;
                });
                var chunkID = 0;
                //If we're in review mode, we have a few more things we need to do...
                $viewport.click(function(e){
                    $('span[data-diff="chunk"]').tooltip('hide');
                });
                if(diff.chunkCount == 0){
                    base.waitingForReview = false;
                    base.restoreEditor();
                    base.$editorialToolsPanelHeaderDropdown.find('li:nth-child(2) a').click();
                    base.$editorialToolsPanelHeaderDropdown.find('li:nth-child(1)').remove();
                    base.$editsPanel.remove();
                    $('.cke_button.cke_button__editorialtools').click();
                }else{
                    $('span[data-diff="chunk"]').each(function(){
                        var container = 'body';
                        if($(this).find('span[data-diff]>a.inline,span[data-diff]>a[resource]').length > 1){
                            $(this).tooltip({
                                "html": true,
                                "title": '<button type="button" class="btn btn-sm btn-primary viewFormatting">View all formatting changes</button>',
                                "trigger": "click",
                                "container": container
                            }).on('shown.bs.tooltip',function(){
                                $chunk = $(this);
                                $('.viewFormatting').off('click').click(function(){
                                    $('#editorialReviewFormattingChanges').modal('show');
                                    $chunk.tooltip('hide');
                                });
                            }).on('show.bs.tooltip',function(){
                                $('span[data-diff="chunk"]').not(this).tooltip('hide');
                            });

                            //Also build a list of changes...But only if we are replacing a visual element with another
                            var $old = $(this).children().first().children('a.inline,a[resource]');
                            var $new = $(this).children().last().children('a.inline,a[resource]');
                            if(!!$old[0] && !!$new[0]){
                                base.determineFormattingChanges($old,$new);
                            }

                            return;
                        }
                        var this_chunkID = chunkID++;
                        $(this).attr('id','chunk_'+chunkID);
                        //For each chunk, make a tooltip...
                        $(this).tooltip({
                            "html": true,
                            "title": '<button type="button" class="btn btn-sm btn-danger">Reject</button> <button type="button" class="btn btn-sm btn-success">Accept</button>',
                            "trigger": "click",
                            "container": container
                        }).on('show.bs.tooltip',function(){
                            $('span[data-diff="chunk"]').not(this).tooltip('hide');
                        }).on('shown.bs.tooltip',function(){
                            var chunkID = $(this).attr('id');
                            $('.tooltip-inner .btn-danger').off('click').click(function(){
                                base.rejectEdit($('#'+chunkID).tooltip('hide'));
                            });
                            $('.tooltip-inner .btn-success').off('click').click(function(){
                                base.acceptEdit($('#'+chunkID).tooltip('hide'))
                            });

                        }).click(function(e){
                            e.stopPropagation();
                        });
                    });
                    $('#editorialReviewEditor').on('scroll',function(){
                        $(this).find('span[data-diff="chunk"]').tooltip('hide');
                    });
                }
            }
        }
        base.acceptEdit = function($chunk,skipSaveCheck){
            $chunk.removeClass('rejected').addClass('accepted');
            if(!!skipSaveCheck){
                return;
            }else if($('span[data-diff="chunk"]:not(.accepted,.rejected)').length == 0){
                base.enableSave(base.$reviewEditor.html());
            }
        }
        base.rejectEdit = function($chunk,skipSaveCheck){
            $chunk.removeClass('accepted').addClass('rejected');
            if(!!skipSaveCheck){
                return;
            }else if($('span[data-diff="chunk"]:not(.accepted,.rejected)').length == 0){
                base.enableSave(base.$reviewEditor.html());
            }
        }

        base.determineFormattingChanges = function($old,$new){
            var oldWasHidden = $old.hasClass('hiddenVisual');
            $old.removeClass('hiddenVisual');
            var oldAttr = jQuery.makeArray($old[0].attributes).sort();
            var parsedOldAttr = {};
            for(var a in oldAttr){
                parsedOldAttr[oldAttr[a].name] = {value:oldAttr[a].nodeValue,changed:false};
            }

            var newAttr = jQuery.makeArray($new[0].attributes).sort();
            var parsedNewAttr = {};
            for(var a in newAttr){
                parsedNewAttr[newAttr[a].name] = {value:newAttr[a].nodeValue,changed:false};
            }

            for(var a in parsedOldAttr){
                if(typeof parsedNewAttr[a] === "undefined"){
                    parsedOldAttr[a].changed = true;
                }else if(parsedOldAttr[a].value != parsedNewAttr[a].value){
                    parsedNewAttr[a].changed = true;
                }
            }
            for(var a in parsedNewAttr){
                if(typeof parsedOldAttr[a] === "undefined"){
                    parsedNewAttr[a].changed = true;
                }
            }
            if(oldWasHidden){
                $old.addClass('hiddenVisual');
            }

            var changeHTML = '<tr><td>';

            var oldMethod = $old.hasClass('inline')?'Inline':'Linked';
            var oldType = (!!parsedOldAttr['data-widget'])?'Widget':'Image';

            if(oldType=="Image"){
                var targetNode = scalarapi.getNode(parsedOldAttr['resource'].value);
                var oldSubtext = targetNode.getDisplayTitle();
            }else{
                var numNodes = parsedOldAttr['data-nodes'].value.split(',').length;
                var oldSubtext = numNodes + (numNodes!=1?'items':'item');
            }
            
            var newMethod = $new.hasClass('inline')?'Inline':'Linked';
            var newType = (!!parsedNewAttr['data-widget'])?'Widget':'Image';

            if(newType=="Image"){
                var targetNode = scalarapi.getNode(parsedNewAttr['resource'].value);
                var newSubtext = targetNode.getDisplayTitle();
            }else{
                var numNodes = parsedNewAttr['data-nodes'].value.split(',').length;
                var newSubtext = numNodes + (numNodes!=1?'items':'item');
            }
            if(oldMethod != newMethod || oldType != newType){
                changeHTML += '<s><strong>'+oldMethod+' '+oldType+'</strong><br />'+oldSubtext+'</s><br />';
            }

            if(oldMethod != newMethod || oldType != oldType){
                changeHTML += '<span class="changed">';
            }

            changeHTML += '<strong>'+newMethod+' '+newType+'</strong><br />'+newSubtext;

            if(oldMethod != newMethod || oldType != oldType){
                changeHTML += '</span>';
            }

            //Second Column: Old Attributes
            changeHTML += '</td><td>';
            var attrNames = Object.keys(parsedOldAttr).sort();
            for(var i in attrNames){
                var a = attrNames[i];
                if(['name','resource','href','class'].indexOf(a) > -1){
                    continue;
                }
                var attribute = parsedOldAttr[a];
                if(['data-annotations','data-nodes'].indexOf(a) > -1){
                    if(attribute.value == ''){
                        var value = '<span class="childNodeList">None</span>';
                    }else{
                        var listLength = attribute.value.split(',').length;
                        var value = '<span class="childNodeList">'+ listLength + ' item'+(listLength!=1?'s':'')+'</span> <a href="#" data-nodes="'+attribute.value+'" class="showAll">Show all</a>';
                    }
                }else{
                    var value = attribute.value;
                }
                changeHTML += '<div class="row"><div class="col-xs-6 attribute">'+a.replace('data-','')+'</div><div class="col-xs-6'+(attribute.changed?' changed':'')+'">'+value+'</div></div>';
            }

            //Third Column: New Attributes
            changeHTML += '</td><td>';

            attrNames = Object.keys(parsedOldAttr).sort();
            for(var i in attrNames){
                var a = attrNames[i];
                if(['name','resource','href','class'].indexOf(a) > -1){
                    continue;
                }
                var attribute = parsedNewAttr[a];
                if(['data-annotations','data-nodes'].indexOf(a) > -1){
                    if(attribute.value == ''){
                        var value = '<span class="childNodeList">None</span>';
                    }else{
                        var listLength = attribute.value.split(',').length;
                        var value = '<span class="childNodeList">'+ listLength + ' item'+(listLength!=1?'s':'')+'</span> <a href="#" data-nodes="'+attribute.value+'" class="showAll">Show all</a>';
                    }
                }else{
                    var value = attribute.value;
                }
                changeHTML += '<div class="row"><div class="col-xs-6 attribute">'+a.replace('data-','')+'</div><div class="col-xs-6'+(attribute.changed?' changed':'')+'">'+value+'</div></div>';
            }

            //Final  Column: Buttons
            changeHTML += '</td><td class="text-center"><button type="button" class="btn btn-sm btn-danger">Reject</button> <button type="button" class="btn btn-sm btn-success">Accept</button><div class="accepted_rejected"><strong class="accepted text-success">Accepted</strong><strong class="rejected text-danger">Rejected</strong> &nbsp; <button class="btn btn-default btn-sm">Cancel</button>';
            changeHTML += '</td></tr>';

            var $chunk = $old.parents('[data-diff="chunk"]');

            var $row = $(changeHTML).appendTo('#editorialReviewFormattingChangesList');
            $row.data('$chunk',$chunk);
            $row.find('.btn-danger').click(function(){
                $(this).parents('td').find('.btn-danger,.btn-success').hide();
                $(this).parents('td').addClass('rejected');
            });
            $row.find('.btn-success').click(function(){
                $(this).parents('td').find('.btn-danger,.btn-success').hide();
                $(this).parents('td').addClass('accepted');
            });
            $row.find('.btn-default').click(function(){
                $(this).parents('td').find('.btn-danger,.btn-success').show();
                $(this).parents('td').removeClass('rejected accepted');
            });
            $row.find('.showAll').click(function(e){
                e.preventDefault();
                var $list = $(this).parent().find('.childNodeList');
                if(!$(this).hasClass('open')){
                    $(this).addClass('open');
                    $(this).text('Hide');
                    var node_list = $(this).attr('data-nodes').split(',');
                    var nodeTitles = [];
                    for(var n in node_list){
                        var slug = node_list[n].replace('*','');
                        nodeTitles.push(slug);
                    }
                    $list.text(nodeTitles.join(', '));
                }else{
                    $(this).removeClass('open');
                    $(this).text('Show All');
                    $list.text($(this).attr('data-nodes').split(',').length+' items');
                }
                //Iterate through each node and add them to the list
                return false;
            });
        }
        base.displayVersions = function(versions,reviewMode){
            //if we only have one version selected, simply show the version - otherwise, show the diff
            base.disableEditor(reviewMode);
            if(versions.length == 1){
                var newHTML = scalar_diff._addNewLinePlaceholders(versions[0].content);
                $('#title_placeholder').text(versions[0].title);
                $('#description_placeholder').text(versions[0].description);
                base.$diffEditor.html(newHTML);
            }else if(versions.length == 2){
                base.createInteractiveDiff(scalar_diff.diff(
                    {
                        'body' : versions[1].content,
                        'title' : versions[1].title,
                        'description' : versions[1].description || ''
                    },
                    {
                        'body' : versions[0].content,
                        'title' : versions[0].title,
                        'description' : versions[0].description || ''
                    },
                    true,
                    true
                ),reviewMode);
            }
        };

        $('head').append('<link rel="stylesheet" href="'+this.path + 'css/editorialTools.css" type="text/css" />');
        editor.addContentsCss( this.path + 'css/editorialToolsInner.css' );
	    
        base.loadEditsPanel = function(){
            var previousState = null;
            if(base.editorialState == "editreview"){
                previousState = "edit";
            }else if(base.editorialState == "clean"){
                previousState = "editreview";
            }else if(base.editorialState == "ready"){
                previousState = "clean";
            }
            if(previousState != null){

                //Go through each of the versions until we find the first instance of the previous state... This shouldn't take long.
                var old_version = null;
                for(var v in base.versionsList){
                    if(base.versionsList[v].editorialState == previousState){
                        old_version = base.versionsList[v];
                    }

                    if((v > 0 && base.versionsList[v].editorialState == base.editorialState) || (old_version != null && base.versionsList[v].editorialState != previousState)){
                        break;
                    }
                }
                if(old_version != null){
                    base.displayVersions([base.versionsList[0],old_version],true);
                }else{
                    base.waitingForReview = false;
                    base.restoreEditor();
                    base.$editorialToolsPanelHeaderDropdown.find('li:nth-child(2) a').click();

                    base.$editorialToolsPanelHeaderDropdown.find('li:nth-child(1)').remove();
                    base.$editsPanel.remove();
                    $('.cke_button.cke_button__editorialtools').click();
                }
            }
        };

        editor.on('instanceReady',function(e){
            if( (base.is_author && base.editorialState === "editreview") ||
                (base.is_editor && base.editorialState === "clean") ){
                $('#editorialReviewFormattingChangesCommit').click(function(){
                    $('#editorialReviewFormattingChangesList td.accepted,#editorialReviewFormattingChangesList td.rejected').each(function(){
                        if($(this).hasClass('rejected')){
                            $('span[data-diff="chunk"]').tooltip('hide');
                            base.rejectEdit($(this).parent().data('$chunk'));
                        }else{
                            $('span[data-diff="chunk"]').tooltip('hide');
                            base.acceptEdit($(this).parent().data('$chunk'));
                        }
                        $(this).parent().remove();
                    });
                    $('#editorialReviewFormattingChanges').modal('hide');
                });
                base.waitingForReview = true;
                base.disableEditor(true);
                $('#title').hide();
                $('#page_description').hide();
            }
        });

	    editor.on('mode',function(e){
            base.currentPageInfo = {
                title : $('#title').val(),
                description : $('#page_description').val()
            };
            $(editor.container.$).find('.cke_button.cke_button__editorialtools').removeClass('active');
            $(editor.container.$).find('.cke_inner').removeClass('editorialToolsExpanded');
            if(!base.addedEditorialToolsPanel){
                base.$editorialToolsPanel = $('<div id="editorialToolsPanel" class="clearfix"></div>').insertAfter($(editor.container.$).find('.cke_contents'));
                base.$editorialToolsPanel.height($(editor.container.$).find('.cke_contents').height());
                base.addedEditorialToolsPanel = true;

                //Build out the various pages of the editorial tools panel
                base.$editorialToolsPanelHeader = $('<div id="editorialToolsPanelHeader"></div>').appendTo(base.$editorialToolsPanel);
                base.$editorialToolsPanelBody = $('<div id="editorialToolsPanelBody"></div>').appendTo(base.$editorialToolsPanel);

                var dropdownHTML =  '<div class="dropdown heading_font">'+
                                        '<button class="btn btn-default dropdown-toggle text-right" type="button" id="editorialToolsPanelHeaderDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><span class="text pull-left"></span> &nbsp; <span class="caret"></span></button>'+
                                        '<ul class="dropdown-menu" aria-labelledby="editorialToolsPanelHeaderDropdown">'+
                                        '</ul>'+
                                    '</div>';
                base.$editorialToolsPanelHeaderDropdown = $(dropdownHTML).appendTo(base.$editorialToolsPanelHeader);

                //Edits
                    if( (base.is_author && base.editorialState === "editreview") ||
                        (base.is_editor && base.editorialState === "clean") ){
                        //Build out the edits panel...
                        base.$editorialToolsPanelHeaderDropdown.find('.dropdown-menu').append('<li><a href="#">Edits</a></li>');
                        base.$editsPanel = $('<div class="editsPanel panel"> \
                                                    <p><strong>This page has been edited.</strong></p> \
                                                    <p>Visible changes are <span data-diff="example">highlighted in yellow</span>, and must be accepted or rejected before the page can be saved.</p> \
                                                    <p>Click the highlights to accept or reject individual edits, or use the buttons below to accept or reject all changes at once.</p> \
                                                    <p id="acceptRejectAll"><button type="button" class="btn btn-danger">Reject all</button><button type="button" class="btn btn-success">Accept all</button></ p>\
                                              </div>').appendTo(base.$editorialToolsPanelBody);

                        $('#acceptRejectAll .btn-danger').click(function(){
                            $('span[data-diff="chunk"]').tooltip('hide').each(function(){
                                base.rejectEdit($(this),true);
                            });
                            base.enableSave(base.$reviewEditor.html());
                        });
                        $('#acceptRejectAll .btn-success').click(function(){
                            $('span[data-diff="chunk"]').tooltip('hide').each(function(){
                                base.acceptEdit($(this),true);
                            });
                            base.enableSave(base.$reviewEditor.html());
                        });
                    }   
                //Queries
                    $('input[value="Save"]').click(function(){
                        $('#unsavedQueryWarning').hide().attr('aria-hidden','true');
                    });
                    base.$editorialToolsPanelHeaderDropdown.find('.dropdown-menu').append('<li><a href="#">Queries</a></li>');
                    if($('#editorial_queries').length > 0){
                        var queries = JSON.parse($('#editorial_queries').val()).queries;
                    }else{
                        var queries = [];
                    }

                    base.$queriesPanel = $('<div class="queriesPanel panel"></div>').appendTo(base.$editorialToolsPanelBody);
                    base.$addNewQueryForm = $('<div id="addNewQueryForm" class="clearfix"><textarea placeholder="Enter query..." class="form-control" id="addNewQueryFormText"></textarea><button type="button" class="pull-right btn btn-sm">Add</button></div>').prependTo(base.$queriesPanel).hide();
                    base.$addNewQueryForm.find('button').click(function(e){
                        var id = ++base.highestID;
                        var query = {
                            id : id,
                            user : fullName,
                            date :  new Date(),
                            body : $('#addNewQueryForm textarea').val(),
                            resolved: false
                        };

                        $('#addNewQueryForm textarea').val('');
                        $('#addNewQueryForm').hide();
                        $('#noQueries').remove();
                        base.addQuery(query,true);
                        base.serializeQueries();
                        e.preventDefault();
                    });

                    base.$addNewQueryButton = $('<button id="addNewQuery" class="pull-right btn btn-sm">Add new</button>').prependTo(base.$editorialToolsPanelHeader);
                    base.$addNewQueryButton.click(function(e){
                        $('#addNewQueryForm').show().find('#addNewQueryFormText').focus();
                        base.$queriesPanel.animate({
                            scrollTop: $('#addNewQueryForm').offset().top-base.$queriesPanel.offset().top
                        }, 200);
                        e.preventDefault();
                    });
                    base.$queries = $('<div class="queries"></div>').appendTo(base.$queriesPanel);
                    var resolvedQueriesHTML = '<div class="resolvedQueries">'+
                                                    '<a class="queryDropdownToggle" href="#">'+
                                                        '<small class="glyphicon glyphicon-triangle-right dropdownCaret" aria-hidden="true" data-toggle="collapse" data-target="#resolvedQueries" aria-expanded="false" aria-controls="resolvedQueries"></small> Resolved queries (<span class="queryCount">0</span>)'+
                                                    '</a>'+
                                                    '<div class="collapse" id="resolvedQueries">'+
                                                    '</div>'+
                                              '</div>';

                    base.$resolvedQueries = $(resolvedQueriesHTML).appendTo(base.$queriesPanel).hide();

                    base.$resolvedQueries.find('.queryDropdownToggle').click(function(e){
                        $(this).parents('.resolvedQueries').find('.collapse').collapse('toggle');
                        e.stopPropagation();
                        return false;
                    });

                    base.$resolvedQueries.find('.collapse').collapse({toggle:false}).on('show.bs.collapse',function(){
                        $(this).parents('.resolvedQueries').find('.queryDropdownToggle small').removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom');
                        $(this).parents('.panel').animate({
                            scrollTop: $('.resolvedQueries').offset().top-base.$queriesPanel.offset().top
                        }, 200);
                    }).on('hide.bs.collapse',function(){
                        $(this).parents('.resolvedQueries').find('.queryDropdownToggle small').removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right');
                    });

                    base.highestID = -1;
                    for(var q in queries){
                        var query = queries[q];
                        if(query.id > base.highestID){
                            base.highestID = query.id;
                        }
                        base.addQuery(query);
                    }
                    if(base.highestID == -1){
                        $('<div id="noQueries" class="text-muted">There are no queries yet.</div>').appendTo(base.$queries);
                    }

                //Versions
                base.$editorialToolsPanelHeaderDropdown.find('.dropdown-menu').append('<li><a href="#">Versions</a></li>');
                base.$versionsPanel = $('<div class="versionsPanel panel"><p>Select two versions to compare the differences between them.</div>').appendTo(base.$editorialToolsPanelBody);
                base.$versionList = $('<div class="versionList"><table><tbody><tr class="loading"><td col-span="3">Loading...</span></td></tr></tbody></table></div>').appendTo(base.$versionsPanel);
                base.$versionListBody = base.$versionList.find('tbody');
                base.versionList = [];
                scalarapi.loadPage( page_slug, true, function(){
                    //build the version tab...
                    base.$versionList.find('.loading').remove();
                    var node = scalarapi.getNode(page_slug);
                    base.versionsList = node.versions;

                    base.versionsList.sort(function(a,b){
                        return b.number - a.number;
                    });
                    var currentNode = true;
                    var prevAuthor = -1;
                    for(var i in node.versions){
                        var version = node.versions[i];
                        var authorID = version.author.split("/").pop();
                        var authorName = authorID != prevAuthor ? contributors[authorID] : '';
                        var versionNumber = version.number;
                        var classes = '';
                        var dateString = '';
                        var $version = $('<tr id="version_'+(version.number)+'"></tr>');
                        if(currentNode){
                            versionNumber = '('+versionNumber+')';
                            $version.addClass('current selected');
                            currentNode = false;
                            dateString = 'Current';
                            base.lastSelectedVersion = $version;
                        }else{
                            var date = new Date(version.created);
                            var hour = date.getHours();
                            var suffix = "am";
                            if(hour > 12){
                                hour -= 12;
                                suffix = "pm";
                            }else if(hour == 0){
                                hour = 12;
                            }
                            dateString = hour+':'+date.getMinutes()+' '+suffix+' '+base.monthNames[date.getMonth()]+' '+date.getDate();
                        }
                        
                        $version
                            .html('<td>'+versionNumber+'</td><td>'+authorName+'</td><td>'+dateString+'</td>')
                            .data('version',version)
                            .click(function(e){
                                e.preventDefault();
                                e.stopPropagation();
                                var version = $(this).data('version');
                                var currentlySelected = base.$versionListBody.find('.selected');
                                if($(this).hasClass('selected') && base.$versionListBody.find('.selected').length > 1){
                                    $(this).removeClass('selected');
                                    if(currentlySelected.length > 1){
                                        base.lastSelectedVersion = currentlySelected.not($(this));
                                    }else{
                                        base.lastSelectedVersion = null;
                                    }
                                }else if(!$(this).hasClass('selected')){
                                    if(base.$versionListBody.find('.selected').length == 0){
                                        base.lastSelectedVersion = $(this);
                                    }else if(base.$versionListBody.find('.selected').length > 1){
                                        base.lastSelectedVersion.removeClass('selected');
                                        base.lastSelectedVersion = base.$versionListBody.find('.selected').first();
                                    }
                                    $(this).addClass('selected');
                                }else{
                                    return false;
                                }
                                currentlySelected = base.$versionListBody.find('.selected');
                                if(currentlySelected.length == 1 && currentlySelected.first().hasClass('current')){
                                    $('.state_dropdown').prop('disabled',base.currentPageInfo.canChangeState);
                                    $('#title').prop('disabled',false).val(base.currentPageInfo.title);
                                    $('#page_description').prop('disabled',false).val(base.currentPageInfo.description);
                                    base.hideVersions();
                                }else{
                                    var versions = [];
                                    currentlySelected.each(function(){
                                        versions.push($(this).data('version'));
                                    });
                                    base.displayVersions(versions);
                                }
                            })
                            .appendTo(base.$versionListBody);
                        prevAuthor = authorID;
                    }


                    if(base.waitingForReview){
                        editor.setReadOnly(false);
                        editor.execCommand('toggleEditorialTools');
                        editor.setReadOnly(true);
                        base.loadEditsPanel();
                    }
                }, null, 0, false, null, 0, 100, false, true);

                //Set up dropdown functionality
                base.$editorialToolsPanelHeaderDropdown.find('button .text').text(base.$editorialToolsPanelHeaderDropdown.find('li>a').first().addClass('active').text());
                base.$editorialToolsPanel.addClass(base.$editorialToolsPanelHeaderDropdown.find('li>a').first().addClass('active').text().toLowerCase());
                if(base.$editorialToolsPanelHeaderDropdown.find('li>a').length > 1){
                    base.$editorialToolsPanelHeaderDropdown.find('li>a').click(function(e){
                        if(base.$editorialToolsPanel.hasClass('versions')){
                            $('.state_dropdown').prop('disabled',base.currentPageInfo.canChangeState);
                            $('#title').prop('disabled',false).val(base.currentPageInfo.title);
                            $('#page_description').prop('disabled',false).val(base.currentPageInfo.description);
                        }else if(base.$editorialToolsPanel.hasClass('edits')){
                            $('body').addClass('isReviewing');
                        }
                        e.preventDefault();
                        base.$editorialToolsPanel.removeClass($(this).parents('ul').find('a.active').removeClass('active').text().toLowerCase());
                        $(this).addClass('active');
                        base.$editorialToolsPanelHeaderDropdown.find('button .text').text($(this).text());
                        base.$editorialToolsPanel.addClass($(this).text().toLowerCase());
                        base.hideVersions();
                    });
                }else{
                    base.$editorialToolsPanelHeaderDropdown.find('button').prop('disabled',true).find('.caret').hide();
                }
                
            }else{
                $editorialToolsPanel.height($(editor.container.$).find('.cke_contents').height());
            }
        });

        editor.addCommand( 'toggleEditorialTools', {
            exec: function( editor ) {
                $(editor.container.$).find('.cke_inner').toggleClass('editorialToolsExpanded');
                $(editor.container.$).find('.cke_button.cke_button__editorialtools').toggleClass('active');
                base.expandedEditorWidth = $(editor.container.$).find('.cke_inner ').outerWidth();
                base.$editorialToolsPanel.width((base.expandedEditorWidth*.3)-4);
            }
        });

        editor.widgets.add( 'edit', {
            init: function() {
                // ...
            }
        });

        editor.ui.addButton( 'editorialTools', {
            label: 'Editorial Tools',
            command: 'toggleEditorialTools',
            toolbar: 'formatting'
        });
    }
});