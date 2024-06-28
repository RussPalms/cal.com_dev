import { API_VERSIONS_VALUES } from "@/lib/api-versions";
import { GetOrg } from "@/modules/auth/decorators/get-org/get-org.decorator";
import { Roles } from "@/modules/auth/decorators/roles/roles.decorator";
import { ApiAuthGuard } from "@/modules/auth/guards/api-auth/api-auth.guard";
import { IsOrgGuard } from "@/modules/auth/guards/organizations/is-org.guard";
import { RolesGuard } from "@/modules/auth/guards/roles/roles.guard";
import { Controller, UseGuards, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiTags as DocsTags } from "@nestjs/swagger";

import { SUCCESS_STATUS } from "@calcom/platform-constants";
import { ApiResponse } from "@calcom/platform-types";
import { Team } from "@calcom/prisma/client";

@Controller({
  path: "/v2/organizations/:orgId/memberships",
  version: API_VERSIONS_VALUES,
})
@UseGuards(ApiAuthGuard, IsOrgGuard, RolesGuard)
@DocsTags("Organizations Memberships")
export class OrganizationsMembershipsController {
  @Get()
  @UseGuards()
  @Roles("ORG_ADMIN")
  async getAllMemberships(
    @Param("orgId", ParseIntPipe) orgId: number,
    @GetOrg() organization: Team,
    @GetOrg("name") orgName: string
  ): Promise<ApiResponse<Team[]>> {
    console.log(orgId, organization, orgName);
    return {
      status: SUCCESS_STATUS,
      data: [],
    };
  }
}
