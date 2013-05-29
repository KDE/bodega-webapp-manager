$(document).ready(function() {
  var sockjs_url = '/indexTakeAssets';
    var sockjs = new SockJS(sockjs_url);
    var categoryPage;
    var subCategoryId;
    sockjs.onopen = function() {
      console.log('[*] open', sockjs.protocol);
      //when the user open the index we have to give him a default category with assets
      //so let's give to him the wallpapers
      $('.dropdown-toggle#23').click();

    }

    sockjs.onmessage = function(e) {
      console.log('testtttttttttttttttt');
      var result = $.parseJSON(e.data);
      templateStatus(true);
      var i = 0;
      $.each(result, function(key, value) {
        populateTemplate(value.id, value.name, value.author, value.version, value.license, value.image, value.largeImage, i%3);
        i = i + 1;
      });

      templateStatus(false);
    }

    sockjs.onclose = function() {
      console.log('[*] close');
    }

    $('ul.nav.nav-tabs li a').click(function(event) {
      removeElementsFromIndex();
      resetPageNumber();
      var assetPages = $(this).attr('assetcount');
      createPageElements(parseInt(assetPages));
      var categoryId = $(this).attr('id');
      subCategoryId = categoryId;
      categoryPage = pageNumber();
      var data = categoryId + '/' + categoryPage;
      sockjs.send(data);
    });

    function populateTemplate(id, name, author, version, license, image, largeImage, separator) {
      if (separator === 0) {
        var separatorContent = $('.row-fluid.show-grid#separator-thumbnail').clone().insertBefore($('.pagination.pagination-centered')).end();
        //in order to clone our template we need to remove its id everytime
        //if we don't remove it then we are going to have multiple entries on the webpage
        separatorContent.attr('id', '');
        var thumbnailContent = $('.span4#thumbnail-template:last');
        thumbnailContent.attr('id', id);

        var thumbnailAsset= thumbnailContent.children('.thumbnail');
        thumbnailAsset.attr('href', '#modalId_' + id);
        thumbnailAsset.children('p').text(name);
        thumbnailAsset.children('img').attr('src', image);
        var modalContent = thumbnailContent.children('.modal.hide.fade');
        modalContent.attr('id', 'modalId_' + id);

        var modalBody = modalContent.children('.modal-body');
        modalBody.children('#modalImageId_').attr('src', largeImage);
        modalBody.children('#modalNameId_').text(name);
        modalBody.children('#modalAuthorId_').text('Author: ' + author);
        modalBody.children('#modalVersionId_').text('Version: ' + version);
        modalBody.children('#modalLicenseId_').text('License: ' + license);
      } else {
        var thumbnailContent = $('.span4#thumbnail-template:last').clone().appendTo($('.thumbnails:last')).end();
        thumbnailContent.attr('id', id);

        var thumbnailAsset = thumbnailContent.children('.thumbnail');
        thumbnailAsset.children('p').text(name);
        thumbnailAsset.children('img').attr('src', image);
        thumbnailAsset.attr('href', '#modalId_' + id);

        var modalContent = thumbnailContent.children('.modal.hide.fade');
        modalContent.attr('id', 'modalId_' + id);

        var modalBody = modalContent.children('.modal-body');
        modalBody.children('#modalImageId_').attr('src', largeImage);
        modalBody.children('#modalNameId_').text(name);
        modalBody.children('#modalAuthorId_').text('Author: ' + author);
        modalBody.children('#modalVersionId_').text('Version: ' + version);
        modalBody.children('#modalLicenseId_').text('License: ' + license);
      }
    }

    function removeElementsFromIndex() {
      //Our template has the id separator-thumbnail. So we select all
      //the thumbnails that doesn't have the id separator-thumbnail
      //We need our template for the feature assets that we are going to
      //call
      var elements = $('.row-fluid.show-grid:not(#separator-thumbnail)');
      elements.remove();
    }

    function templateStatus(setVisible) {
      var template = $('.row-fluid.show-grid#separator-thumbnail');
      //When our assets are being printed into the UI then we must hide our template.
      //But we must make it again visible for the future assets that we are going to call
      //overwise our future assets will be invisible.
      if (setVisible) {
        template.show();
      } else {
        template.hide();
      }
    }

    function pageNumber() {
      var pageId = $('.pagination.pagination-centered li.active').attr('id');
      if (pageId) {
      var id = pageId.replace('pageId_', '');
      console.log("pageId " + id);
      } else {
        return 1;
      }
      return parseInt(id);
    }

    $('.pagination.pagination-centered li#Next').click(function(event) {
      var currentActivePage = $('.pagination.pagination-centered ul li.active');
      var nextPage = currentActivePage.next();
      if (nextPage.attr('id') !== 'Next') {
        currentActivePage.removeClass('active');
        nextPage.addClass('active');
        removeElementsFromIndex();
        var data = subCategoryId + '/' + pageNumber();
        sockjs.send(data);
      }
    });

    $('.pagination.pagination-centered li#Prev').click(function(event) {
        var currentActivePage = $('.pagination.pagination-centered ul li.active');
        var prevPage = currentActivePage.prev();
        if (prevPage.attr('id') !== 'Prev') {
          currentActivePage.removeClass('active');
          prevPage.addClass('active');
          removeElementsFromIndex();
          var data = subCategoryId + '/' + pageNumber();
          sockjs.send(data);
        }
    });

     $('.pagination.pagination-centered li').click(function(event) {
      var currentPage = $(this).attr('id');
      if (currentPage !== "Prev" && currentPage !== "Next") {
        $('.pagination.pagination-centered li.active').removeClass('active');
        $(this).addClass('active');
        removeElementsFromIndex();
        var data = subCategoryId + '/' + pageNumber();
        sockjs.send(data);
      }
    });

    function resetPageNumber() {
      //when we change our current channel we must reset the page
      //number to the first page. Otherwise the sockjs will
      //load the that specific page for our asset
      var currentActivePage = $('.pagination.pagination-centered ul li.active');
      currentActivePage.removeClass('active');
      $('.pagination.pagination-centered ul li#pageId_1').addClass('active');
    }

    function createPageElements(count) {
      removePageElements();
      for (var i = 1; i<= count; i++) {
        var pageContent = $('.pagination.pagination-centered li#pageId_1').clone(true);
        pageContent.children('a').text(i);
        pageContent.attr('id', 'pageId_' + i);
        pageContent.removeClass('active');
        if (i ==1) {
          pageContent.addClass('active');
          continue;
        }
        pageContent.insertAfter($('.pagination.pagination-centered ul li:eq(-2)')).end();
      }
    }

    function removePageElements() {
      var elements = $('.pagination.pagination-centered ul li');
      elements.each(function () {
        var pageId = $(this).attr('id');
        console.log($(this))
        if (pageId !== "Prev" && pageId !== "Next" && pageId !== 'pageId_1') {
          $(this).remove();
        }
      });
    }

    $(function() {
      $('.accordion-inner').jScrollPane({
        verticalDragMinHeight: 20,
        verticalDragMaxHeight: 40,
        horizontalDragMinWidth: 20,
        horizontalDragMaxWidth: 40,
        autoReinitialise: true
      });
    });
  });
