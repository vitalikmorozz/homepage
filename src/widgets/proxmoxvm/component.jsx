import BlockWithProgress from "components/services/widget/block-with-progress";
import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import useSWR from "swr";

export default function ProxmoxVM({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data, error } = useSWR(`/api/proxmox/stats/${widget.node}/${widget.vmid}?type=${widget.type || "qemu"}`);

  if (error) {
    return <Container service={service} error={error} />;
  }

  const showCPU = widget.stats?.cpu ?? true;
  const showMem = widget.stats?.mem ?? true;
  const showMemPr = widget.stats?.memPr ?? false;
  const showUptime = (widget.stats?.uptime && data?.uptime > 0) ?? false;
  const showDisk = widget.stats?.disk ?? false;

  if (!data) {
    return (
      <Container service={service}>
        {showCPU && <Block label="resources.cpu" />}
        {showMem && <Block label="resources.mem" />}
        {showMemPr && <Block label="resources.mem" />}
        {showUptime && <Block label="resources.uptime" />}
        {showDisk && <Block label="resources.disk" />}
      </Container>
    );
  }

  return (
    <Container service={service}>
      {showCPU && (
        <BlockWithProgress
          label="resources.cpu"
          value={t("common.percent", { value: data.cpu * 100 })}
          bar={{ enabled: true, max: 100, current: data.cpu * 100, orientation: "vertical" }}
        />
      )}
      {showMem && (
        <Block label="resources.mem" value={t("common.bytes", { value: data.mem })} />
      )}
      {showMemPr && (
        <BlockWithProgress
          label="resources.mem"
          value={t("common.percent", { value: (data.mem / data.maxMem) * 100 })}
          bar={{ enabled: true, max: 100, current: (data.mem / data.maxMem) * 100, orientation: "vertical" }}
        />
      )}
      {showUptime && <Block label="resources.uptime" value={t("common.duration", { value: data.uptime })} />}
      {showDisk && (
        <BlockWithProgress
          label="resources.disk"
          value={t("common.percent", { value: (data.disk / data.maxDisk) * 100 })}
          bar={{ enabled: true, max: 100, current: (data.disk / data.maxDisk) * 100, orientation: "vertical" }}
        />
      )}
    </Container>
  );
}
