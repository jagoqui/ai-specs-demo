import { type Env } from "@/variables/domain/models/env.model";

import { getEnvs } from "../mappers/env.mapper";

export const VARIABLES: Env = getEnvs();
