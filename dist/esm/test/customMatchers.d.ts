/// <reference types="jasmine" />
import CustomMatcherFactories = jasmine.CustomMatcherFactories;
export interface IToHaveOrder {
    predecessor: string;
    successor: string;
}
export interface ICustomArrayLikeMatchers extends jasmine.ArrayLikeMatchers<string> {
    toHaveOrder(expected: any, expectationFailOutput?: any): boolean;
}
export declare const CustomMatchers: CustomMatcherFactories;
