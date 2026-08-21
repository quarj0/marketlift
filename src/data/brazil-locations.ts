export type BrazilRegionCode = 'N' | 'NE' | 'CO' | 'SE' | 'S';

export const brazilRegions = [
  { code: 'N', name: 'Norte' },
  { code: 'NE', name: 'Nordeste' },
  { code: 'CO', name: 'Centro-Oeste' },
  { code: 'SE', name: 'Sudeste' },
  { code: 'S', name: 'Sul' },
] as const;

export type BrazilState = {
  code: string;
  name: string;
  regionCode: BrazilRegionCode;
  /** Fallback suggestions used if the municipality catalog is temporarily unavailable. */
  cities: readonly string[];
};

export const brazilLocations: readonly BrazilState[] = [
  { code: 'AC', name: 'Acre', regionCode: 'N', cities: ['Rio Branco', 'Cruzeiro do Sul'] },
  { code: 'AL', name: 'Alagoas', regionCode: 'NE', cities: ['Maceió', 'Arapiraca'] },
  { code: 'AP', name: 'Amapá', regionCode: 'N', cities: ['Macapá', 'Santana'] },
  { code: 'AM', name: 'Amazonas', regionCode: 'N', cities: ['Manaus', 'Parintins'] },
  { code: 'BA', name: 'Bahia', regionCode: 'NE', cities: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari'] },
  { code: 'CE', name: 'Ceará', regionCode: 'NE', cities: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'] },
  { code: 'DF', name: 'Distrito Federal', regionCode: 'CO', cities: ['Brasília'] },
  { code: 'ES', name: 'Espírito Santo', regionCode: 'SE', cities: ['Vitória', 'Vila Velha', 'Serra'] },
  { code: 'GO', name: 'Goiás', regionCode: 'CO', cities: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde'] },
  { code: 'MA', name: 'Maranhão', regionCode: 'NE', cities: ['São Luís', 'Imperatriz'] },
  { code: 'MT', name: 'Mato Grosso', regionCode: 'CO', cities: ['Cuiabá', 'Várzea Grande', 'Rondonópolis'] },
  { code: 'MS', name: 'Mato Grosso do Sul', regionCode: 'CO', cities: ['Campo Grande', 'Dourados'] },
  { code: 'MG', name: 'Minas Gerais', regionCode: 'SE', cities: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'] },
  { code: 'PA', name: 'Pará', regionCode: 'N', cities: ['Belém', 'Ananindeua', 'Santarém'] },
  { code: 'PB', name: 'Paraíba', regionCode: 'NE', cities: ['João Pessoa', 'Campina Grande'] },
  { code: 'PR', name: 'Paraná', regionCode: 'S', cities: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa'] },
  { code: 'PE', name: 'Pernambuco', regionCode: 'NE', cities: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru'] },
  { code: 'PI', name: 'Piauí', regionCode: 'NE', cities: ['Teresina', 'Parnaíba'] },
  { code: 'RJ', name: 'Rio de Janeiro', regionCode: 'SE', cities: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'Petrópolis'] },
  { code: 'RN', name: 'Rio Grande do Norte', regionCode: 'NE', cities: ['Natal', 'Mossoró'] },
  { code: 'RS', name: 'Rio Grande do Sul', regionCode: 'S', cities: ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas'] },
  { code: 'RO', name: 'Rondônia', regionCode: 'N', cities: ['Porto Velho', 'Ji-Paraná'] },
  { code: 'RR', name: 'Roraima', regionCode: 'N', cities: ['Boa Vista'] },
  { code: 'SC', name: 'Santa Catarina', regionCode: 'S', cities: ['Florianópolis', 'Joinville', 'Blumenau'] },
  { code: 'SP', name: 'São Paulo', regionCode: 'SE', cities: ['São Paulo', 'Campinas', 'Guarulhos', 'Santos', 'Ribeirão Preto', 'Sorocaba'] },
  { code: 'SE', name: 'Sergipe', regionCode: 'NE', cities: ['Aracaju', 'Nossa Senhora do Socorro'] },
  { code: 'TO', name: 'Tocantins', regionCode: 'N', cities: ['Palmas', 'Araguaína'] },
] as const;

export function getBrazilState(stateCode: string | null | undefined) {
  return brazilLocations.find((state) => state.code === stateCode?.toUpperCase());
}

export function getBrazilRegion(regionCode: string | null | undefined) {
  return brazilRegions.find((region) => region.code === regionCode);
}
