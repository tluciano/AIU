;(function ( $, window, document, undefined ) {

		var pluginName = "AIU",
				defaults = {
				'photo_input' : '#photo_input',
			            	'photo_preview' : '#photo_preview',
			            	'photo_form' : '#photo_form',
			            	'photo_error' : '.photo_error',
			            	'img_loading_path' : 'images/ajax-loader.gif',
				'php_path' : 'photo_controller.php'
		};

		// Constructor
		function Plugin ( element, options ) {
				this.call_ID = $(element).attr("id");
				this.element = element;
				this._input = $("#"+this.call_ID +" input[type='file']");
				this._options = options;
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		Plugin.prototype = {
				init: function () {

					$(this._input).on("change", $.proxy(function(){
						var photo_preview = this.settings.photo_preview;
						var photo_error = this.settings.photo_error;
						var image_default = $(photo_preview).attr("src"); 	/* Saves the default-image path. If something fails, it'll be shown again..*/
						var the_data = this;
						 if(! this.isAjaxUploadSupported()){
						            var iframe = document.createElement("iframe");
						            iframe.setAttribute("id", "upload_iframe_myFile");
						            iframe.setAttribute("name", "upload_iframe_myFile");
						            iframe.setAttribute("width", "0");
						            iframe.setAttribute("height", "0");
						            iframe.setAttribute("border", "0");
						            iframe.setAttribute("src","javascript:false;");
						            iframe.style.display = "none";
						            var form = document.createElement("form");
						            form.setAttribute("target", "upload_iframe_myFile");
						            form.setAttribute("action", this.settings.php_path);
						            form.setAttribute("method", "post");
						            form.setAttribute("enctype", "multipart/form-data");
						            form.setAttribute("encoding", "multipart/form-data");
						            form.style.display = "none";

						            var files = $(this)[0];
						            form.appendChild(files);
						            $(photo_preview).attr("src", this.settings.img_loading_path).addClass("loading");
						            $(photo_error).hide();  /* Hides the error message, if it is visible.*/

						            document.body.appendChild(form);
						            document.body.appendChild(iframe);

						            iframeIdmyFile = document.getElementById("upload_iframe_myFile");
						            var eventHandlermyFile = function () {
						                if (iframeIdmyFile.detachEvent)
						                    iframeIdmyFile.detachEvent("onload", eventHandlermyFile);
						                else
						                    iframeIdmyFile.removeEventListener("load", eventHandlermyFile, false);

						                response = this.getIframeContentJSON(iframeIdmyFile);
						                if(response.success)
						                {
						                    $(photo_preview).attr("src", response.src).removeClass("loading");
						                }
						                else
						                {
						                    $(photo_preview).attr("src", image_default).removeClass("loading");
						                         if(response.msg) {
						                            $(photo_error).show().html(response.msg);
						                        } else {
						                            $(photo_error).show().html(" An error occured. Check the image extension and size.");
						                        }
						                }
						            };

						            if (iframeIdmyFile.addEventListener)
						                iframeIdmyFile.addEventListener("load", eventHandlermyFile, true);
						            if (iframeIdmyFile.attachEvent)
						                iframeIdmyFile.attachEvent("onload", eventHandlermyFile);

						            form.submit();

						            $(photo_form).append(the_data);

						        } else {
						                 /*********************************************************** Nice Browsers ********************************************************************************/
						            var data = new FormData();
						            data.append("Photo", $(this._input).prop("files")[0]);

						            $(photo_preview).attr("src", this.settings.img_loading_path).addClass("loading");
						            $(photo_error).hide(); /* Hides the error message, if it is visible.*/
						            $.ajax(
						            {
						                url: this.settings.php_path,
						                secureuri: false,
						                fileElementId: 'photo_input',
						                dataType: "json",
						                data: data,
						                cache: false,
						                enctype: "multipart/form-data",
						                type: "POST",
						                processData: false,
						                contentType: false,
						                success: function(data)
						                {
						                   if(data.success)
						                   {
						                        $(photo_preview).attr("src", data.src).removeClass("loading");
						                   }
						                   else
						                   {
						                        $(photo_preview).attr("src", image_default).removeClass("loading");
						                       if (data.msg) {
						                            $(photo_error).show().html(data.msg);
						                        } else {
						                            $(photo_error).show().html(" An error occured. Check the image extension and size.");
						                        }
						                   }
						                },
						                error: function(xhr, textStatus, errorThrown)
						                {
						                    $(photo_preview).attr("src", image_default).removeClass("loading");
						                     if (data.msg) {
						                            $(photo_error).show().html(data.msg);
						                        } else {
						                            $(photo_error).show().html(" An error occured. Check the image extension and size.");
						                        }
						                    return false;
						                }
						            });
						        }
					}, this));

				},

				'isAjaxUploadSupported' : function(){
			       		     var input = document.createElement("input");
				                input.type = "file";
				                return (
				                        "multiple" in input &&
				                        typeof File != "undefined" &&
				                        typeof FormData != "undefined" &&
				                        typeof (new XMLHttpRequest()).upload != "undefined"
				                        );
			    },

			    	'getIframeContentJSON': function(iframe){
				        try {
				                    var doc = iframe.contentDocument ? iframe.contentDocument: iframe.contentWindow.document,
				                        response;
				                    var innerHTML = doc.body.innerHTML;
				                    if (innerHTML.slice(0, 5).toLowerCase() == "<pre>" && innerHTML.slice(-6).toLowerCase() == "</pre>") {
				                        innerHTML = doc.body.firstChild.firstChild.nodeValue;
				                    }
				                    response = eval("(" + innerHTML + ")");
				                } catch(err){
				                    response = {success: false};
				                }

				                return response;
			    }
		};

		$.fn[ pluginName ] = function ( options ) {
				this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});

				return this;
		};

})( jQuery, window, document );