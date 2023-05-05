export interface Trees {
    type: string;
    features: FeaturesEntity[] | null;
}
export interface FeaturesEntity {
    type: string;
    id: number;
    geometry: Geometry;
    properties: Properties;
}
export interface Geometry {
    type: string;
    coordinates: number[] | null;   // longitude, latitude
}
export interface Properties {
    OBJECTID: number;
    globalid: string;
    CreationDa: number;
    Creator: string;
    EditDate: number;
    Editor: string;
    common_nam: string;
    what_tree_: string;
    scientific: string;
    cultivar: string;
    whats_the_: number;
    commemorat: string;
    FamilyName: string;
    YearPlaned: string;
}
