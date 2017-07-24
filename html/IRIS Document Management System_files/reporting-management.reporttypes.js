(function () {
    irisAppDependencies.add('iris_reportingmgmt_reporttypes');

    angular.module('iris_reportingmgmt_reporttypes', []);

    const module = angular.module('iris_reportingmgmt_reporttypes');

    module.factory('ReportType', function ($resource) {
        return $resource(`${iris.config.apiUrl}/reporting/projects/:projectId/report-types/:id`, {projectId: '@projectId', id: '@id'});
    });

    // Create the service
    module.factory('ReportTypeService', function ($translate, ReportType) {

        var defaultReportTypesLabels = [
            $translate.instant('label.ReportType.AdvanceReport'),
            $translate.instant('label.ReportType.RingBuildReport'),
            $translate.instant('label.ReportType.MachineReport'),
            $translate.instant('label.ReportType.PerformanceReport'),
            $translate.instant('label.ReportType.ShiftReport'),
            $translate.instant('label.ReportType.ProjectReport'),
            $translate.instant('label.ReportType.DailyReport'),
            $translate.instant('label.ReportType.WeeklyReport'),
            $translate.instant('label.ReportType.MonthlyReport'),
            $translate.instant('label.ReportType.DowntimeEvaluation'),
            $translate.instant('label.ReportType.PerformanceTables'),
            $translate.instant('label.ReportType.CompositeReport')
        ];

        return {
            getReportTypes(projectId) {
                return ReportType.query({projectId}).$promise;
            },

            getReportType(projectId, id) {
                return ReportType.get({projectId, id}).$promise;
            },

            saveReportType(reportType) {
                return ReportType.save(reportType).$promise;
            },

            newReportType(params) {
                return new ReportType(params);
            },

            deleteReportType(reportType) {
                console.log(reportType);
                return ReportType.delete(reportType).$promise;
            },

            getDefaultReportTypes(projectId){
                return defaultReportTypesLabels.map(label => {
                    return {
                        projectId,
                        label,
                        labelTranslations: {},
                        isSelected: true
                    }
                });
            }
        }
    })
})();