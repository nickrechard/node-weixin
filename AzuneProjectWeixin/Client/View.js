﻿"use strict";
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$=$;
//var myApp=global.myApp;
var tpMsgPane = require('./template/message.hbs');
var tpSidebar = require('./template/sidebar.hbs');
var tpGeneral = require('./template/general.hbs');
var Msg = require('./models');
var Settings={};
var SettingView = Backbone.View.extend({
    initialize: function (options) {
        $(".settings-content").removeClass('active');
        this.sidebar = new Sidebar({
            el: '.settings-sidebar',
            pane: options.pane,
            model:this.model
        });
        this.listenTo(myApp.router, 'route:settings', this.changePane);
        
    },
    changePane: function (pane) {
        if (!pane) {
            return;
        }
        this.sidebar.showContent(pane);
    },
    render: function () {
        this.sidebar.render();
//        if(!this.sidebar.pane)
//        	this.showContent('general');
//        else
//        	this.sidebar.renderPane({});
    }
    
});
var Sidebar = Backbone.View.extend({
    initialize: function (options) {
    	
    	this.el=options.el;
        this.render();

        this.menu = this.$('.settings-menu');
    },
    models: {},
    events: {
        'click .settings-menu li': 'switchPane'
    },
    render: function () {
//    	for (item in this.$el){
//    		alert(item+" "+this.$el[item]);
//    	}
    	//this.el.html(tpSidebar());
    
        //$(this.el).html("bb");
        var ml = tpSidebar({});
        ml=ml.substring(1);
        this.$el.html('');
       this.$el.html(ml);
    	return this;
    },
    switchPane: function (e) {
        e.preventDefault();
        var item = $(e.currentTarget),
            id = item.find('a').attr('href').substring(1);
        
        this.showContent(id);
    },

    showContent: function (id) {
        
        
        var self = this,
            model;
        myApp.router.navigate('/settings/' + id + '/');
        //myApp.trigger('urlchange');
        if (this.pane && id === this.pane.id) {
            return;
        }
        if(this.pane)
        this.pane.destroy();
        this.setActive(id);
        var toDisplay=Settings[id];
        if(toDisplay){
        	this.pane =new toDisplay({ el: '.settings-content' }); 
        }else{
        	this.pane=new Settings.Pane({ el: '.settings-content' });
        }
        this.pane.render();
//
//        if (!this.models.hasOwnProperty(this.pane.options.modelType)) {
//            model = this.models[this.pane.options.modelType] = new Ghost.Models[this.pane.options.modelType]();
//            model.fetch().then(function () {
//                self.renderPane(model);
//            });
//        } else {
//            model = this.models[this.pane.options.modelType];
//            self.renderPane(model);
//        }
    },

    renderPane: function (model) {
        this.pane.model = model;
        this.pane.render();
    },

    setActive: function (id) {
    	this.menu = this.$('.settings-menu');
        this.menu.find('li').removeClass('active');
        var submenu= this.menu.find('.submenu');
        for (var i = 0; i < submenu.length; i++) {
            submenu[i].style.display = 'none';
        }
        this.menu.find('a[href=#' + id + ']').parent().addClass('active');
        var ind = id.indexOf('_');
        var frameID;
        //It is a submenu, first make the submenu display
        if (ind > 0) {
            frameID= id.substring(0, ind);
        } else {
            frameID = id;
        }
        if (this.menu.find('#' + frameID).length>0) {
            this.menu.find('#' + frameID)[0].style.display = 'block';
        } 
        
    }
});
Settings.Pane = Backbone.View.extend({
    destroy: function () {
        this.$el.removeClass('active');
        this.undelegateEvents();
    },
    render: function () {
        this.$el.hide();
        this.$el.html("Selected pane does not exist");
        this.$el.fadeIn(300);
    },
    afterRender: function () {
    	
        this.$el.attr('id', this.id);
        this.$el.addClass('active');
    },
    saveSuccess: function (model, response, options) {
        /*jshint unused:false*/
//        Ghost.notifications.clearEverything();
//        Ghost.notifications.addItem({
//            type: 'success',
//            message: 'Saved',
//            status: 'passive'
//        });
    },
    saveError: function (model, xhr) {
        /*jshint unused:false*/
//        Ghost.notifications.clearEverything();
//        Ghost.notifications.addItem({
//            type: 'error',
//            message: Ghost.Views.Utils.getRequestErrorMessage(xhr),
//            status: 'passive'
//        });
    },
    validationError: function (message) {
//        Ghost.notifications.clearEverything();
//        Ghost.notifications.addItem({
//            type: 'error',
//            message: message,
//            status: 'passive'
//        });
    }
});
    // ### General settings
 Settings.general = Settings.Pane.extend({
    id: "general",

//    events: {
//        'click .button-save': 'saveSettings',
//        'click .js-modal-logo': 'showLogo',
//        'click .js-modal-cover': 'showCover'
//    },

    saveSettings: function () {
        var self = this,
            title = this.$('#blog-title').val(),
            description = this.$('#blog-description').val(),
            email = this.$('#email-address').val(),
            postsPerPage = this.$('#postsPerPage').val(),
            permalinks = this.$('#permalinks').is(':checked') ? '/:year/:month/:day/:slug/' : '/:slug/',
            validationErrors = [];

        if (!validator.isLength(title, 0, 150)) {
            validationErrors.push({ message: "Title is too long", el: $('#blog-title') });
        }

        if (!validator.isLength(description, 0, 200)) {
            validationErrors.push({ message: "Description is too long", el: $('#blog-description') });
        }

        if (!validator.isEmail(email) || !validator.isLength(email, 0, 254)) {
            validationErrors.push({ message: "Please supply a valid email address", el: $('#email-address') });
        }

        if (!validator.isInt(postsPerPage) || postsPerPage > 1000) {
            validationErrors.push({ message: "Please use a number less than 1000", el: $('postsPerPage') });
        }

        if (!validator.isInt(postsPerPage) || postsPerPage < 0) {
            validationErrors.push({ message: "Please use a number greater than 0", el: $('postsPerPage') });
        }


        if (validationErrors.length) {
            validator.handleErrors(validationErrors);
        } else {
            this.model.save({
                title: title,
                description: description,
                email: email,
                postsPerPage: postsPerPage,
                activeTheme: this.$('#activeTheme').val(),
                permalinks: permalinks
            }, {
                success: this.saveSuccess,
                error: this.saveError
            }).then(function () { self.render(); });
        }
    },
    showLogo: function (e) {
        e.preventDefault();
        var settings = this.model.toJSON();
        this.showUpload('logo', settings.logo);
    },
    showCover: function (e) {
        e.preventDefault();
        var settings = this.model.toJSON();
        this.showUpload('cover', settings.cover);
    },
    showUpload: function (key, src) {
        var self = this,
            upload = new Ghost.Models.uploadModal({
                'key': key, 'src': src, 'id': this.id, 'accept': {
                    func: function () { // The function called on acceptance
                        var data = {};
                        if (this.$('.js-upload-url').val()) {
                            data[key] = this.$('.js-upload-url').val();
                        } else {
                            data[key] = this.$('.js-upload-target').attr('src');
                        }

                        self.model.save(data, {
                            success: self.saveSuccess,
                            error: self.saveError
                        }).then(function () {
                            self.saveSettings();
                        });

                        return true;
                    },
                    buttonClass: "button-save right",
                    text: "Save" // The accept button text
                }
            });

        this.addSubview(new Ghost.Views.Modal({
            model: upload
        }));
    },
    render: function () {
        var ml = tpGeneral();
        
        this.$el.html(ml);
        this.$el.attr('id', this.id);
        this.$el.addClass('active');
    }
});
Settings.messages = Settings.Pane.extend({
    id: "messages",
    initialize: function (options){
        
        if (options.collection) {
            this.collection = options.collection;
        }else if (!this.collection) {
            this.collection = new Msg.List();
        }  
    },

    render: function () {
        var self = this;
        var deferred = this.collection.fetch();
        deferred.done(function () {
            var ml = tpMsgPane({ message: self.collection.toJSON() });
            if (ml[0] != '<') {
                ml = ml.substring(1);
            }
            self.$el.html(ml);
            self.$el.attr('id', this.id);
            self.$el.addClass('active');
        });
        console.log(this.collection);
    }
});
module.exports={
		Setting:SettingView,
		Sidebar:Sidebar,
		Panes:Settings,
};