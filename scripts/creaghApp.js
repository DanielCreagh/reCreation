angular.module('creationApp', ['dataService'])
.controller('creaghController', function($scope, dataService, $http) {
		var vm = this;
		vm.nav = "About";
		vm.projectsNav = "Main";

    dataService.getContactsData().
      success(function(data, status, headers, config) {
        vm.contactsData = data;
      }).
      error(function(data, status, headers, config) {
        console.log(data);
      });

    dataService.getprojectCategoriesData().
      success(function(data, status, headers, config) {
        vm.projectcategories = data;
      }).
      error(function(data, status, headers, config) {
        console.log(data);
      });

    dataService.getFlashProjectsData().
      success(function(data, status, headers, config) {
        vm.flashProjectsData = data;
      }).
      error(function(data, status, headers, config) {
        console.log(data);
      });

    dataService.getHtml5ProjectsData().
      success(function(data, status, headers, config) {
        vm.html5ProjectsData = data;
      }).
      error(function(data, status, headers, config) {
        console.log(data);
      });

    dataService.getIOSProjectsData().
      success(function(data, status, headers, config) {
        vm.iOSProjectsData = data;
      }).
      error(function(data, status, headers, config) {
        console.log(data);
      });

    dataService.getOtherProjectsData().
      success(function(data, status, headers, config) {
        vm.otherProjectsData = data;
      }).
      error(function(data, status, headers, config) {
        console.log(data);
      });
	});
