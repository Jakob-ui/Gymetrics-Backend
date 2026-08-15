import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class Equipment {
  @Prop({ required: true })
  name!: string;
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);

@Schema({ _id: false })
export class MuskelGruppe {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: [EquipmentSchema], default: [] })
  equipment!: Equipment[];
}

export const MuskelGruppeSchema = SchemaFactory.createForClass(MuskelGruppe);

@Schema({ _id: false })
export class Studio {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  href!: string;

  @Prop({ type: [MuskelGruppeSchema], default: [] })
  muskelgruppen!: MuskelGruppe[];
}

export const StudioSchema = SchemaFactory.createForClass(Studio);

@Schema({ _id: false })
export class City {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: [StudioSchema], default: [] })
  studios!: Studio[];
}

export const CitySchema = SchemaFactory.createForClass(City);

@Schema({
  collection: 'fitness_studios',
  timestamps: { createdAt: '_createdAt', updatedAt: '_updatedAt' },
})
export class FitnessStudio extends Document {
  @Prop({ required: true, unique: true, index: true })
  country!: string;

  @Prop({ type: [CitySchema], default: [] })
  cities!: City[];

  _createdAt!: Date;
  _updatedAt!: Date;
}

export const FitnessStudioSchema = SchemaFactory.createForClass(FitnessStudio);
FitnessStudioSchema.index({ 'cities.name': 1 });
FitnessStudioSchema.index({ 'cities.studios.name': 'text' });
