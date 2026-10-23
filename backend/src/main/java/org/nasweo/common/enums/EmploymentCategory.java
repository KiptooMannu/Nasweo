package org.nasweo.common.enums;

public enum EmploymentCategory {
    SCIENTIST(65),
    NON_SCIENTIST(60);

    private final int retirementAge;

    EmploymentCategory(int retirementAge) {
        this.retirementAge = retirementAge;
    }

    public int getRetirementAge() {
        return retirementAge;
    }
}
