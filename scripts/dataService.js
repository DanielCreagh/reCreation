angular.module('dataService', [])
  .service('dataService', function( $http ) {
    var service = {
      getContactsData: function() {
        return $http.get('data/contactsData.JSON');
      },
      getprojectCategoriesData: function() {
        return $http.get('data/projectCategories.JSON');
      },
      getFlashProjectsData: function() {
        return $http.get('data/flashProjectsData.JSON');
      },
            getHtml5ProjectsData: function() {
        return $http.get('data/html5ProjectsData.JSON');
      },
            getIOSProjectsData: function() {
        return $http.get('data/iOSProjectsData.JSON');
      },
      getOtherProjectsData: function() {
        return $http.get('data/otherProjectsData.JSON');
      }
    }
    return service;
	});