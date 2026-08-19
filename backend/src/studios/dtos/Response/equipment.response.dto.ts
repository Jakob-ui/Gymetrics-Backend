export class MuskelgruppeResponseDto {
  name!: string;

  equipment!: string[];
}

export class EquipmentResponseDto {
  name!: string;

  muscleGroups!: MuskelgruppeResponseDto[];
}
