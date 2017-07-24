/**
 * Created by kulmann on 18.09.15.
 */

(function () {
    angular.module('iris_subjects', []);

    angular.module('iris_subjects').factory('Subjects', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/security/subjects/:id", {
            id: '@id'
        });
    }]);

    angular.module('iris_subjects').factory('SubjectsService', ['Subjects', '$filter',
        function (Subjects, $filter) {
            var subjects = Subjects.query({}, function (value) {
                return value;
            });

            var autocreate_subjects = ['Project', 'Device'];

            return {
                getSubjects: function () {
                    return subjects;
                },

                getSubject: function (id) {
                    return Subjects.get({id: id});
                },

                removeSubject: function (subject) {
                    return subject.$remove({}, function (value) {
                        for (var i = 0; i < subjects.length; i++) {
                            if (subjects[i].id == value.id) {
                                subjects.splice(i, 1);
                                break;
                            }
                        }
                        return value;
                    });
                },

                createSubject: function (subject) {
                    subject = subject || {};
                    return new Subjects(subject);
                },

                filter: function (filter, strict) {
                    strict = strict || true;
                    return $filter('filter')(subjects, filter, strict);
                },

                saveSubject: function (subject) {
                    var is_new = !subject.id;
                    return subject.$save(function (subject) {
                        if (is_new) {
                            subjects.push(subject);
                        }
                        else {
                            for (var i = 0; i < subjects.length; i++) {
                                var el = subjects[i];
                                if (el.id == subject.id) {
                                    angular.extend(el, subject);
                                    break;
                                }
                            }
                        }
                        return subject;
                    })
                },

                getSubjectByNameAndId: function (subject_id, subject_name) {
                    subject_id = subject_id ? subject_id.toString() : subject_id;
                    var subjects = this.filter({subjectId: subject_id, name: subject_name});
                    if(!subjects.length) return null;

                    return subjects[0];
                },

                getAutoCreatedList: function () {
                    return autocreate_subjects;
                }
            };
        }
    ]);

})();
